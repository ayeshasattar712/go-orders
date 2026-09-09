import { PERMISSIONS } from '@/constants/roles';
import { isResponse, requirePermission, requireStaffSession } from '@/lib/api-guard';
import { prisma } from '@/lib/prisma';
import { serializeQuotation } from '@/lib/enterprise-mapper';
import { successResponse } from '@/lib/api-response';

export async function GET(request: Request) {
  const session = await requireStaffSession(request);
  if (isResponse(session)) return session;

  const allowed = requirePermission(session, PERMISSIONS.QUOTATIONS_READ);
  if (allowed !== true) return allowed;

  const quotations = await prisma.quotation.findMany({
    include: { client: true },
    orderBy: { requestedAt: 'desc' },
  });

  return successResponse({ quotations: quotations.map(serializeQuotation) });
}
