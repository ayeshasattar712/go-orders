import { InvoiceStatus as PrismaInvoiceStatus, InvoiceType } from '@prisma/client';
import { isResponse, requireCustomerSession } from '@/lib/api-guard';
import { prisma } from '@/lib/prisma';
import { errorResponse, successResponse } from '@/lib/api-response';
import type { Invoice } from '@/types/enterprise';

const STATUS: Record<PrismaInvoiceStatus, Invoice['status']> = {
  DRAFT: 'draft',
  SENT: 'sent',
  PAID: 'paid',
  PARTIAL: 'partial',
  OVERDUE: 'overdue',
  CREDIT: 'credit',
};

const TYPE: Record<InvoiceType, Invoice['type']> = {
  RECEIVABLE: 'receivable',
  PAYABLE: 'payable',
};

export async function GET(request: Request) {
  const session = await requireCustomerSession(request);
  if (isResponse(session)) return session;

  const client = await prisma.client.findUnique({ where: { userId: session.sub } });
  if (!client) return successResponse({ invoices: [] });

  const invoices = await prisma.invoice.findMany({
    where: { clientId: client.id },
    orderBy: { issueDate: 'desc' },
  });

  return successResponse({
    invoices: invoices.map((invoice): Invoice => ({
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      vendorOrCustomer: invoice.vendorOrCustomer,
      clientId: invoice.clientId ?? undefined,
      type: TYPE[invoice.type],
      issueDate: invoice.issueDate.toISOString(),
      dueDate: invoice.dueDate.toISOString(),
      amount: invoice.amount,
      amountPaid: invoice.amountPaid,
      status: STATUS[invoice.status],
      orderNumber: invoice.orderNumber ?? undefined,
    })),
  });
}

export async function POST(request: Request) {
  const session = await requireCustomerSession(request);
  if (isResponse(session)) return session;

  const body = (await request.json()) as { invoiceId?: string };
  if (!body.invoiceId) {
    return errorResponse('Invoice id required', { status: 422, code: 'VALIDATION_ERROR' });
  }

  const client = await prisma.client.findUnique({ where: { userId: session.sub } });
  const invoice = await prisma.invoice.findUnique({ where: { id: body.invoiceId } });
  if (!invoice || invoice.clientId !== client?.id) {
    return errorResponse('Invoice not found', { status: 404, code: 'NOT_FOUND' });
  }

  const text = [
    'GoOrder Invoice',
    `Invoice: ${invoice.invoiceNumber}`,
    `Order: ${invoice.orderNumber ?? '—'}`,
    `Customer: ${invoice.vendorOrCustomer}`,
    `Issued: ${invoice.issueDate.toISOString().slice(0, 10)}`,
    `Amount: ${invoice.amount.toFixed(2)}`,
    `Paid: ${invoice.amountPaid.toFixed(2)}`,
    `Status: ${invoice.status}`,
  ].join('\n');

  return successResponse({ filename: `${invoice.invoiceNumber}.txt`, content: text });
}
