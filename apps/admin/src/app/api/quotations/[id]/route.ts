import { QuotationStatus as PrismaQuotationStatus } from '@prisma/client';
import { PERMISSIONS } from '@/constants/roles';
import { isResponse, requirePermission, requireStaffSession } from '@/lib/api-guard';
import { prisma } from '@/lib/prisma';
import { serializeQuotation } from '@/lib/enterprise-mapper';
import { errorResponse, successResponse } from '@/lib/api-response';

const STATUS: Record<string, PrismaQuotationStatus> = {
  requested: 'REQUESTED',
  approved: 'APPROVED',
  rejected: 'REJECTED',
};

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireStaffSession(request);
  if (isResponse(session)) return session;

  const allowed = requirePermission(session, PERMISSIONS.QUOTATIONS_WRITE);
  if (allowed !== true) return allowed;

  const { id } = await params;
  const body = (await request.json()) as { status?: string };
  const nextStatus = body.status ? STATUS[body.status] : undefined;
  if (!nextStatus) {
    return errorResponse('Invalid status', { status: 422, code: 'VALIDATION_ERROR' });
  }

  const quotation = await prisma.quotation.findUnique({ where: { id } });
  if (!quotation) {
    return errorResponse('Quotation not found', { status: 404, code: 'NOT_FOUND' });
  }

  const updated = await prisma.quotation.update({
    where: { id },
    data: {
      status: nextStatus,
      respondedAt: nextStatus === 'REQUESTED' ? null : new Date(),
    },
    include: { client: true },
  });

  return successResponse({ quotation: serializeQuotation(updated) });
}
