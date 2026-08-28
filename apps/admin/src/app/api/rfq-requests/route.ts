import { PERMISSIONS } from '@/constants/roles';
import { isResponse, requirePermission, requireStaffSession } from '@/lib/api-guard';
import { prisma } from '@/lib/prisma';
import { serializeRfqRequest } from '@/lib/enterprise-mapper';
import { successResponse } from '@/lib/api-response';

export async function GET(request: Request) {
  const session = await requireStaffSession(request);
  if (isResponse(session)) return session;

  const allowed = requirePermission(session, PERMISSIONS.RFQ_READ);
  if (allowed !== true) return allowed;

  const rfqs = await prisma.rfqRequest.findMany({ orderBy: { createdAt: 'desc' } });

  return successResponse({ rfqs: rfqs.map(serializeRfqRequest) });
}

export async function POST(request: Request) {
  const session = await requireStaffSession(request);
  if (isResponse(session)) return session;

  const allowed = requirePermission(session, PERMISSIONS.RFQ_WRITE);
  if (allowed !== true) return allowed;

  const body = await request.json();
  const rfq = await prisma.rfqRequest.create({
    data: {
      ...body,
      status: body.status ? body.status.toUpperCase() : 'DRAFT',
      createdAt: body.createdAt ? new Date(body.createdAt) : new Date(),
    },
  });

  return successResponse({ rfq: serializeRfqRequest(rfq) }, { status: 201 });
}
