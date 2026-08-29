import { NextResponse } from 'next/server';
import { isResponse, requireCustomerSession } from '@/lib/api-guard';
import { prisma } from '@/lib/prisma';
import { errorResponse } from '@/lib/api-response';
import { buildInvoicePdf, invoiceToPdfInput, pdfDownloadHeaders } from '@/lib/invoice-pdf';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireCustomerSession(request);
  if (isResponse(session)) return session;

  const { id } = await params;
  const client = await prisma.client.findUnique({ where: { userId: session.sub } });
  const invoice = await prisma.invoice.findUnique({
    where: { id },
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
