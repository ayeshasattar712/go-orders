import { NextResponse } from 'next/server';
import { PERMISSIONS } from '@/constants/roles';
import { isResponse, requirePermission, requireStaffSession } from '@/lib/api-guard';
import { prisma } from '@/lib/prisma';
import { errorResponse } from '@/lib/api-response';
import { buildInvoicePdf, invoiceToPdfInput, pdfDownloadHeaders } from '@/lib/invoice-pdf';

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

  const bytes = await buildInvoicePdf(invoiceToPdfInput(invoice, invoice.client));
  return new NextResponse(Buffer.from(bytes), {
    status: 200,
    headers: pdfDownloadHeaders(`${invoice.invoiceNumber}.pdf`),
  });
}
