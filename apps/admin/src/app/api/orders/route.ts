import { PERMISSIONS } from '@/constants/roles';
import { isResponse, requirePermission, requireStaffSession } from '@/lib/api-guard';
import { prisma } from '@/lib/prisma';
import { serializeAdminOrder } from '@/lib/orders/order-mapper';
import { successResponse } from '@/lib/api-response';

/** Staff order processing — lists every customer's orders, not just one. */
export async function GET(request: Request) {
  const session = await requireStaffSession(request);
  if (isResponse(session)) return session;

  const allowed = requirePermission(session, PERMISSIONS.ORDERS_READ);
  if (allowed !== true) return allowed;

  const orders = await prisma.order.findMany({
    include: { items: true, timeline: true, user: true },
    orderBy: { date: 'desc' },
  });

  return successResponse({ orders: orders.map(serializeAdminOrder) });
}
