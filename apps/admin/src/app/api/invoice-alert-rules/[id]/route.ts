import { PERMISSIONS } from '@/constants/roles';
import { isResponse, requirePermission, requireStaffSession } from '@/lib/api-guard';
import { prisma } from '@/lib/prisma';
import { serializeInvoiceAlertRule } from '@/lib/enterprise-mapper';
import { errorResponse, successResponse } from '@/lib/api-response';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireStaffSession(request);
  if (isResponse(session)) return session;

  const allowed = requirePermission(session, PERMISSIONS.INVOICES_WRITE);
  if (allowed !== true) return allowed;

  const { id } = await params;
  const body = (await request.json()) as { enabled?: boolean };
  const rule = await prisma.invoiceAlertRule.findUnique({ where: { id } });
  if (!rule) {
    return errorResponse('Rule not found', { status: 404, code: 'NOT_FOUND' });
  }

  const updated = await prisma.invoiceAlertRule.update({
    where: { id },
    data: { enabled: body.enabled ?? !rule.enabled },
  });

  return successResponse({ rule: serializeInvoiceAlertRule(updated) });
}
