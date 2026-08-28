import { isResponse, requireCustomerSession } from '@/lib/api-guard';
import { prisma } from '@/lib/prisma';
import { serializeOrder } from '@/lib/orders/order-mapper';
import { errorResponse, successResponse } from '@/lib/api-response';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orderNumber: string }> },
) {
  const session = await requireCustomerSession(request);
  if (isResponse(session)) return session;

  const { orderNumber } = await params;
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { items: true, timeline: true },
  });

  // Ownership check — a customer can never fetch another customer's order.
  if (!order || order.userId !== session.sub) {
    return errorResponse('Order not found', { status: 404, code: 'NOT_FOUND' });
  }

  return successResponse({ order: serializeOrder(order) });
}
