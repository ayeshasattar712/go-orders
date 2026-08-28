import { PERMISSIONS } from '@/constants/roles';
import { isResponse, requirePermission, requireStaffSession } from '@/lib/api-guard';
import { prisma } from '@/lib/prisma';
import { successResponse } from '@/lib/api-response';

export async function GET(request: Request) {
  const session = await requireStaffSession(request);
  if (isResponse(session)) return session;

  const allowed = requirePermission(session, PERMISSIONS.ANALYTICS_READ);
  if (allowed !== true) return allowed;

  const vendors = await prisma.vendor.findMany({
    select: { name: true, fulfillmentRate: true },
    orderBy: { name: 'asc' },
  });

  const vendorPerformanceScores = vendors.map((vendor) => ({
    label: vendor.name,
    value: vendor.fulfillmentRate,
  }));

  return successResponse({ vendorPerformanceScores });
}
