import { PERMISSIONS } from '@/constants/roles';
import { isResponse, requirePermission, requireStaffSession } from '@/lib/api-guard';
import { prisma } from '@/lib/prisma';
import { serializeInventoryItem } from '@/lib/enterprise-mapper';
import { successResponse } from '@/lib/api-response';

export async function GET(request: Request) {
  const session = await requireStaffSession(request);
  if (isResponse(session)) return session;

  const allowed = requirePermission(session, PERMISSIONS.INVENTORY_READ);
  if (allowed !== true) return allowed;

  const items = await prisma.inventoryItem.findMany({
    include: { warehouse: true },
    orderBy: { name: 'asc' },
  });

  return successResponse({ items: items.map(serializeInventoryItem) });
}
