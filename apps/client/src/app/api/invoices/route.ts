import { NextResponse } from 'next/server';
import { InvoiceStatus as PrismaInvoiceStatus, InvoiceType } from '@prisma/client';
import { isResponse, requireCustomerSession } from '@/lib/api-guard';
import { prisma } from '@/lib/prisma';
import { errorResponse, successResponse } from '@/lib/api-response';
import { buildInvoicePdf, invoiceToPdfInput, pdfDownloadHeaders } from '@/lib/invoice-pdf';
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
  const invoice = await prisma.invoice.findUnique({
    where: { id: body.invoiceId },
    include: { client: true },
  });
  if (!client || !invoice || invoice.clientId !== client.id) {
    return errorResponse('Invoice not found', { status: 404, code: 'NOT_FOUND' });
  }

  const bytes = await buildInvoicePdf(invoiceToPdfInput(invoice, invoice.client));
  return new NextResponse(Buffer.from(bytes), {
    status: 200,
    headers: pdfDownloadHeaders(`${invoice.invoiceNumber}.pdf`),
  });
}
