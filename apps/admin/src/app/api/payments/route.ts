import { PERMISSIONS } from '@/constants/roles';
import { isResponse, requirePermission, requireStaffSession } from '@/lib/api-guard';
import { prisma } from '@/lib/prisma';
import { serializeReceivedPayment } from '@/lib/enterprise-mapper';
import { successResponse } from '@/lib/api-response';

export async function GET(request: Request) {
  const session = await requireStaffSession(request);
  if (isResponse(session)) return session;

  const allowed = requirePermission(session, PERMISSIONS.INVOICES_READ);
  if (allowed !== true) return allowed;

  const payments = await prisma.payment.findMany({
    include: { order: { include: { user: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return successResponse({ payments: payments.map(serializeReceivedPayment) });
}
