import { NextResponse } from 'next/server';
import { PERMISSIONS } from '@/constants/roles';
import { isResponse, requirePermission, requireStaffSession } from '@/lib/api-guard';
import { prisma } from '@/lib/prisma';
import { errorResponse } from '@/lib/api-response';
import { buildInvoicePdf, invoiceToPdfInput, pdfFileHeaders } from '@/lib/invoice-pdf';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireStaffSession(request);
  if (isResponse(session)) return session;

  const allowed = requirePermission(session, PERMISSIONS.INVOICES_READ);
  if (allowed !== true) return allowed;

  const { id } = await params;
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { client: true },
  });
  if (!invoice) {
    return errorResponse('Invoice not found', { status: 404, code: 'NOT_FOUND' });
  }

  const inline = new URL(request.url).searchParams.get('inline') === '1';
  const bytes = await buildInvoicePdf(invoiceToPdfInput(invoice, invoice.client), {
    flatten: inline,
  });
  return new NextResponse(Buffer.from(bytes), {
    status: 200,
    headers: pdfFileHeaders(`${invoice.invoiceNumber}.pdf`, inline ? 'inline' : 'attachment'),
  });
}
