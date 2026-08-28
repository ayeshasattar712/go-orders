import { PERMISSIONS } from '@/constants/roles';
import { isResponse, requirePermission, requireStaffSession } from '@/lib/api-guard';
import { prisma } from '@/lib/prisma';
import { serializeDemandForecastItem } from '@/lib/enterprise-mapper';
import { successResponse } from '@/lib/api-response';

export async function GET(request: Request) {
  const session = await requireStaffSession(request);
  if (isResponse(session)) return session;

  const allowed = requirePermission(session, PERMISSIONS.INVENTORY_READ);
  if (allowed !== true) return allowed;

  const items = await prisma.demandForecastItem.findMany({ orderBy: { product: 'asc' } });

  return successResponse({ items: items.map(serializeDemandForecastItem) });
}
