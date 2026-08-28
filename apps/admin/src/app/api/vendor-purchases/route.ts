import { PERMISSIONS } from '@/constants/roles';
import { isResponse, requirePermission, requireStaffSession } from '@/lib/api-guard';
import { prisma } from '@/lib/prisma';
import { serializeVendorPurchase } from '@/lib/enterprise-mapper';
import { successResponse } from '@/lib/api-response';

export async function GET(request: Request) {
  const session = await requireStaffSession(request);
  if (isResponse(session)) return session;

  const allowed = requirePermission(session, PERMISSIONS.VENDORS_READ);
  if (allowed !== true) return allowed;

  const purchases = await prisma.vendorPurchase.findMany({
    include: { vendor: true },
    orderBy: { purchaseDate: 'desc' },
  });

  return successResponse({ purchases: purchases.map(serializeVendorPurchase) });
}
