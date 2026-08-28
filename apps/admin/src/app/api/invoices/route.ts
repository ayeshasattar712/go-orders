import { InvoiceType } from '@prisma/client';
import { PERMISSIONS } from '@/constants/roles';
import { isResponse, requirePermission, requireStaffSession } from '@/lib/api-guard';
import { prisma } from '@/lib/prisma';
import { serializeInvoice } from '@/lib/enterprise-mapper';
import { errorResponse, successResponse } from '@/lib/api-response';

export async function GET(request: Request) {
  const session = await requireStaffSession(request);
  if (isResponse(session)) return session;

  const allowed = requirePermission(session, PERMISSIONS.INVOICES_READ);
  if (allowed !== true) return allowed;

  const invoices = await prisma.invoice.findMany({
    include: { client: true },
    orderBy: { issueDate: 'desc' },
  });

  return successResponse({ invoices: invoices.map(serializeInvoice) });
}

export async function POST(request: Request) {
  const session = await requireStaffSession(request);
  if (isResponse(session)) return session;

  const allowed = requirePermission(session, PERMISSIONS.INVOICES_WRITE);
  if (allowed !== true) return allowed;

  const body = (await request.json()) as {
    clientId?: string;
    vendorOrCustomer?: string;
    amount?: number;
    issueDate?: string;
    dueDate?: string;
    orderNumber?: string;
    type?: 'receivable' | 'payable';
  };

  if (!body.amount || body.amount <= 0) {
    return errorResponse('Amount is required', { status: 422, code: 'VALIDATION_ERROR' });
  }

  const client = body.clientId
    ? await prisma.client.findUnique({ where: { id: body.clientId } })
    : null;

  const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(10_000 + Math.random() * 89_999)}`;
  const now = body.issueDate ? new Date(body.issueDate) : new Date();
  const due = body.dueDate
    ? new Date(body.dueDate)
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const party = body.vendorOrCustomer || client?.companyName || 'Customer';
  const isPayable = body.type === 'payable';

  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber,
      vendorOrCustomer: party,
      clientId: client?.id,
      type: isPayable ? InvoiceType.PAYABLE : InvoiceType.RECEIVABLE,
      issueDate: now,
      dueDate: due,
      amount: body.amount,
      amountPaid: 0,
      status: 'SENT',
      orderNumber: body.orderNumber || undefined,
    },
  });

  await prisma.ledgerEntry.createMany({
    data: isPayable
      ? [
          {
            date: now,
            account: 'Operating Expense',
            description: `Bill ${invoiceNumber} from ${party}`,
            debit: body.amount,
            credit: 0,
          },
          {
            date: now,
            account: 'Accounts Payable',
            description: `Bill ${invoiceNumber}`,
            debit: 0,
            credit: body.amount,
          },
        ]
      : [
          {
            date: now,
            account: 'Accounts Receivable',
            description: `Invoice ${invoiceNumber} issued to ${party}`,
            debit: body.amount,
            credit: 0,
          },
          {
            date: now,
            account: 'Sales Revenue',
            description: `Invoice ${invoiceNumber}`,
            debit: 0,
            credit: body.amount,
          },
        ],
  });

  if (client && !isPayable) {
    await prisma.appNotification.create({
      data: {
        clientId: client.id,
        type: 'INVOICE',
        title: 'New invoice',
        message: `Invoice ${invoiceNumber} for ${body.amount.toFixed(2)} is ready.`,
        href: '/invoices',
      },
    });
    await prisma.client.update({
      where: { id: client.id },
      data: {
        outstandingBalance: { increment: body.amount },
        dueAmount: { increment: body.amount },
      },
    });
  }

  return successResponse({ invoice: serializeInvoice(invoice) }, { status: 201 });
}
