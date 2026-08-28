import { PERMISSIONS } from '@/constants/roles';
import { isResponse, requirePermission, requireStaffSession } from '@/lib/api-guard';
import { prisma } from '@/lib/prisma';
import { successResponse } from '@/lib/api-response';

export async function GET(request: Request) {
  const session = await requireStaffSession(request);
  if (isResponse(session)) return session;

  const allowed = requirePermission(session, PERMISSIONS.ANALYTICS_READ);
  if (allowed !== true) return allowed;

  const orders = await prisma.order.findMany({
    select: { date: true, total: true },
    orderBy: { date: 'asc' },
  });

  const monthly = new Map<string, { revenue: number; profit: number; expenses: number }>();
  for (const order of orders) {
    const key = order.date.toLocaleDateString('en-US', { month: 'short' });
    const existing = monthly.get(key) ?? { revenue: 0, profit: 0, expenses: 0 };
    existing.revenue += order.total;
    existing.expenses += order.total * 0.6;
    existing.profit = existing.revenue - existing.expenses;
    monthly.set(key, existing);
  }

  const monthlyRevenue = Array.from(monthly.entries()).map(([month, data]) => ({
    month,
    ...data,
  }));

  return successResponse({ monthlyRevenue });
}
