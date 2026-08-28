import { InvoiceStatus, PaymentStatus } from '@prisma/client';
import { PERMISSIONS } from '@/constants/roles';
import { isResponse, requirePermission, requireStaffSession } from '@/lib/api-guard';
import { prisma } from '@/lib/prisma';
import { serializeReceivedPayment } from '@/lib/enterprise-mapper';
import { errorResponse, successResponse } from '@/lib/api-response';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireStaffSession(request);
  if (isResponse(session)) return session;

  const allowed = requirePermission(session, PERMISSIONS.INVOICES_WRITE);
  if (allowed !== true) return allowed;

  const { id } = await params;
  const body = (await request.json()) as { status?: 'confirmed' | 'awaiting-transfer' | 'pending' };
  const payment = await prisma.payment.findUnique({
    where: { id },
    include: { order: { include: { user: true } } },
  });
  if (!payment) {
    return errorResponse('Payment not found', { status: 404, code: 'NOT_FOUND' });
  }

  const nextStatus =
    body.status === 'confirmed'
      ? PaymentStatus.CONFIRMED
      : body.status === 'awaiting-transfer'
        ? PaymentStatus.AWAITING_TRANSFER
        : body.status === 'pending'
          ? PaymentStatus.PENDING
          : PaymentStatus.CONFIRMED;

  const now = new Date();
  const updated = await prisma.payment.update({
    where: { id },
    data: {
      status: nextStatus,
      paidAt: nextStatus === PaymentStatus.CONFIRMED ? now : payment.paidAt,
    },
    include: { order: { include: { user: true } } },
  });

  if (nextStatus === PaymentStatus.CONFIRMED && payment.status !== PaymentStatus.CONFIRMED) {
    const invoice = await prisma.invoice.findFirst({
      where: { orderNumber: payment.order.orderNumber },
    });
    if (invoice && invoice.status !== InvoiceStatus.PAID) {
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: { status: InvoiceStatus.PAID, amountPaid: invoice.amount },
      });
      await prisma.ledgerEntry.createMany({
        data: [
          {
            date: now,
            account: 'Cash / Bank',
            description: `Bank / online transfer ${payment.reference} for ${invoice.invoiceNumber}`,
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
        await prisma.client.update({
          where: { id: invoice.clientId },
          data: {
            outstandingBalance: { decrement: invoice.amount - invoice.amountPaid },
            dueAmount: { decrement: invoice.amount - invoice.amountPaid },
          },
        });
      }
    }
  }

  return successResponse({ payment: serializeReceivedPayment(updated) });
}
