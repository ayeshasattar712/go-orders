import { InvoiceStatus as PrismaInvoiceStatus } from '@prisma/client';
import { PERMISSIONS } from '@/constants/roles';
import { isResponse, requirePermission, requireStaffSession } from '@/lib/api-guard';
import { prisma } from '@/lib/prisma';
import { serializeInvoice } from '@/lib/enterprise-mapper';
import { errorResponse, successResponse } from '@/lib/api-response';

const STATUS: Record<string, PrismaInvoiceStatus> = {
  draft: 'DRAFT',
  sent: 'SENT',
  paid: 'PAID',
  partial: 'PARTIAL',
  overdue: 'OVERDUE',
  credit: 'CREDIT',
};

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireStaffSession(request);
  if (isResponse(session)) return session;

  const allowed = requirePermission(session, PERMISSIONS.INVOICES_WRITE);
  if (allowed !== true) return allowed;

  const { id } = await params;
  const body = (await request.json()) as { status?: string; amountPaid?: number };
  const invoice = await prisma.invoice.findUnique({ where: { id } });
  if (!invoice) {
    return errorResponse('Invoice not found', { status: 404, code: 'NOT_FOUND' });
  }

  const nextStatus = body.status ? STATUS[body.status] : invoice.status;
  if (body.status && !nextStatus) {
    return errorResponse('Invalid status', { status: 422, code: 'VALIDATION_ERROR' });
  }

  const amountPaid =
    nextStatus === 'PAID' ? invoice.amount : (body.amountPaid ?? invoice.amountPaid);

  const updated = await prisma.invoice.update({
    where: { id },
    data: { status: nextStatus, amountPaid },
  });

  if (nextStatus === 'PAID' && invoice.status !== 'PAID') {
    const now = new Date();
    await prisma.ledgerEntry.createMany({
      data: [
        {
          date: now,
          account: 'Cash / Bank',
          description: `Payment received ${invoice.invoiceNumber} (bank or online transfer)`,
          debit: invoice.amount,
          credit: 0,
        },
        {
          date: now,
          account: 'Accounts Receivable',
          description: `Settle ${invoice.invoiceNumber}`,
          debit: 0,
          credit: invoice.amount,
        },
      ],
    });
    if (invoice.clientId) {
      await prisma.appNotification.create({
        data: {
          clientId: invoice.clientId,
          type: 'PAYMENT',
          title: 'Payment received',
          message: `Invoice ${invoice.invoiceNumber} marked paid via bank / online transfer.`,
          href: '/invoices',
        },
      });
      await prisma.client.update({
        where: { id: invoice.clientId },
        data: {
          outstandingBalance: { decrement: invoice.amount - invoice.amountPaid },
          dueAmount: { decrement: invoice.amount - invoice.amountPaid },
        },
      });
    }
  }

  return successResponse({ invoice: serializeInvoice(updated) });
}
