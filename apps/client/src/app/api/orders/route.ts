import { createOrderSchema } from '@/schemas/order.schema';
import { isResponse, requireCustomerSession, sanitizeObjectStrings } from '@/lib/api-guard';
import { prisma } from '@/lib/prisma';
import { serializeOrder, loadDeliveriesByOrderNumbers } from '@/lib/orders/order-mapper';
import { placeMarketplaceOrder } from '@/lib/commerce/fulfill-order';
import { errorResponse, internalErrorResponse, successResponse } from '@/lib/api-response';
import { logger } from '@/lib/logger';

/** Lists the signed-in customer's own orders only — never another customer's. */
export async function GET(request: Request) {
  const session = await requireCustomerSession(request);
  if (isResponse(session)) return session;

  const records = await prisma.order.findMany({
    where: { userId: session.sub },
    include: { items: true, timeline: true, payment: true },
    orderBy: { date: 'desc' },
  });
  const deliveries = await loadDeliveriesByOrderNumbers(records.map((order) => order.orderNumber));

  return successResponse({
    orders: records.map((order) => serializeOrder(order, deliveries.get(order.orderNumber))),
  });
}

/** Places a real order: payment, invoice, tracking number, and delivery job. */
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

    const user = await prisma.user.findUnique({ where: { id: session.sub } });
    if (!user) {
      return errorResponse('Account not found', { status: 401, code: 'UNAUTHORIZED' });
    }

    const paymentMethod =
      parsed.data.paymentMethod === 'bank-account' ? 'BANK_ACCOUNT' : 'ONLINE_TRANSFER';

    const result = await placeMarketplaceOrder({
      userId: session.sub,
      customerName: `${user.firstName} ${user.lastName}`.trim(),
      customerEmail: user.email,
      items: parsed.data.items,
      vendorName: parsed.data.vendorName,
      shipping: parsed.data.shipping,
      tax: parsed.data.tax,
      paymentMethod,
      transferReference: parsed.data.transferReference,
      deliveryOption: parsed.data.deliveryOption,
      address: parsed.data.address,
    });

    logger.info('Order placed', { userId: session.sub, orderNumber: result.order.orderNumber });

    return successResponse(
      {
        order: serializeOrder(result.order),
        invoiceNumber: result.invoiceNumber,
        paymentReference: result.paymentReference,
        trackingNumber: result.trackingNumber,
      },
      { status: 201, message: 'Order placed successfully' },
    );
  } catch (error) {
    logger.error('Order creation failed', {
      error: error instanceof Error ? error.message : 'unknown',
    });
    return internalErrorResponse(error);
  }
}
