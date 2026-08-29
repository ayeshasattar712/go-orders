import { NextResponse } from 'next/server';
import { isResponse, requireCustomerSession } from '@/lib/api-guard';
import { prisma } from '@/lib/prisma';
import { errorResponse } from '@/lib/api-response';
import { buildOrderPdf, orderToPdfInput, pdfDownloadHeaders } from '@/lib/order-pdf';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orderNumber: string }> },
) {
  const session = await requireCustomerSession(request);
  if (isResponse(session)) return session;

  const { orderNumber } = await params;
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { items: true, payment: true, user: true },
  });
  if (!order || order.userId !== session.sub) {
    return errorResponse('Order not found', { status: 404, code: 'NOT_FOUND' });
  }

  const bytes = await buildOrderPdf(orderToPdfInput(order));
  return new NextResponse(Buffer.from(bytes), {
    status: 200,
    headers: pdfDownloadHeaders(`${order.orderNumber}.pdf`),
  });
}
