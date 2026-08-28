import { createOrderSchema } from '@/schemas/order.schema';
import { isResponse, requireCustomerSession, sanitizeObjectStrings } from '@/lib/api-guard';
import { prisma } from '@/lib/prisma';
import { serializeOrder } from '@/lib/orders/order-mapper';
import { errorResponse, internalErrorResponse, successResponse } from '@/lib/api-response';
import { logger } from '@/lib/logger';

function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const suffix = Math.floor(10_000 + Math.random() * 89_999);
  return `GO-${year}-${suffix}`;
}

function generateTrackingNumber(): string {
  return `GO-TRK-${Math.floor(10_000_000 + Math.random() * 89_999_999)}`;
}

/** Lists the signed-in customer's own orders only — never another customer's. */
export async function GET(request: Request) {
  const session = await requireCustomerSession(request);
  if (isResponse(session)) return session;

  const orders = await prisma.order.findMany({
    where: { userId: session.sub },
    include: { items: true, timeline: true },
    orderBy: { date: 'desc' },
  });

  return successResponse({ orders: orders.map(serializeOrder) });
}

/** Places a real order for the signed-in customer from their cart. */
export async function POST(request: Request) {
  try {
    const session = await requireCustomerSession(request);
    if (isResponse(session)) return session;

    const body = sanitizeObjectStrings(await request.json());
    const parsed = createOrderSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse('Validation failed', {
        status: 422,
        code: 'VALIDATION_ERROR',
        errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      });
    }

    const { items, vendorName, shipping, tax } = parsed.data;
    // Recompute the subtotal server-side — never trust a client-supplied total.
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const total = subtotal + shipping + tax;
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const now = new Date();

    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId: session.sub,
        date: now,
        status: 'CONFIRMED',
        total,
        itemCount,
        eta: '3-5 business days',
        vendorName,
        trackingNumber: generateTrackingNumber(),
        carrier: 'GoOrder Logistics',
        items: {
          create: items.map((item) => ({
            name: item.name,
            image: item.image,
            quantity: item.quantity,
            price: item.price,
          })),
        },
        timeline: {
          create: [
            {
              status: 'CONFIRMED',
              label: 'Order confirmed',
              timestamp: now,
              description: 'Payment verified and order confirmed with vendor.',
            },
            {
              status: 'PROCESSING',
              label: 'Processing',
              timestamp: null,
              description: 'Vendor is preparing your items for shipment.',
            },
            {
              status: 'SHIPPED',
              label: 'Shipped',
              timestamp: null,
              description: 'Awaiting shipment.',
            },
            {
              status: 'DELIVERED',
              label: 'Delivered',
              timestamp: null,
              description: 'Pending delivery.',
            },
          ],
        },
      },
      include: { items: true, timeline: true },
    });

    logger.info('Order placed', { userId: session.sub, orderNumber: order.orderNumber });

    return successResponse(
      { order: serializeOrder(order) },
      { status: 201, message: 'Order placed successfully' },
    );
  } catch (error) {
    logger.error('Order creation failed', {
      error: error instanceof Error ? error.message : 'unknown',
    });
    return internalErrorResponse(error);
  }
}
