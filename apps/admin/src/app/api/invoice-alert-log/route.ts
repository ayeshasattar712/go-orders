import { PERMISSIONS } from '@/constants/roles';
import { isResponse, requirePermission, requireStaffSession } from '@/lib/api-guard';
import { prisma } from '@/lib/prisma';
import { serializeInvoiceAlertLogEntry } from '@/lib/enterprise-mapper';
import { successResponse } from '@/lib/api-response';

export async function GET(request: Request) {
  const session = await requireStaffSession(request);
  if (isResponse(session)) return session;

  const allowed = requirePermission(session, PERMISSIONS.INVOICES_READ);
  if (allowed !== true) return allowed;

  const logs = await prisma.invoiceAlertLogEntry.findMany({ orderBy: { sentAt: 'desc' } });

  return successResponse({ logs: logs.map(serializeInvoiceAlertLogEntry) });
}
