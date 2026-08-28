import { PERMISSIONS } from '@/constants/roles';
import { isResponse, requirePermission, requireStaffSession } from '@/lib/api-guard';
import { prisma } from '@/lib/prisma';
import { serializeAsset } from '@/lib/enterprise-mapper';
import { successResponse } from '@/lib/api-response';

export async function GET(request: Request) {
  const session = await requireStaffSession(request);
  if (isResponse(session)) return session;

  const allowed = requirePermission(session, PERMISSIONS.ASSETS_READ);
  if (allowed !== true) return allowed;

  const assets = await prisma.asset.findMany({ orderBy: { name: 'asc' } });

  return successResponse({ assets: assets.map(serializeAsset) });
}
