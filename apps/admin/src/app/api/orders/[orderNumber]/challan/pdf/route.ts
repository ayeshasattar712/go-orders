import { NextResponse } from 'next/server';
import { PERMISSIONS } from '@/constants/roles';
import { isResponse, requirePermissions, requireStaffSession } from '@/lib/api-guard';
import { prisma } from '@/lib/prisma';
import { errorResponse } from '@/lib/api-response';
import { buildChallanPdf, challanToPdfInput, pdfDownloadHeaders } from '@/lib/challan-pdf';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orderNumber: string }> },
) {
  const session = await requireStaffSession(request);
  if (isResponse(session)) return session;

  const allowed = requirePermissions(session, [
    PERMISSIONS.DELIVERY_READ,
    PERMISSIONS.ORDERS_READ,
  ]);
  if (allowed !== true) return allowed;

  const { orderNumber } = await params;
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { items: true, user: true },
  });
  if (!order) {
    return errorResponse('Order not found', { status: 404, code: 'NOT_FOUND' });
  }

  const job = await prisma.deliveryJob.findFirst({
    where: { orderNumber },
    orderBy: { createdAt: 'desc' },
  });

  const bytes = await buildChallanPdf(challanToPdfInput(order, job));
  return new NextResponse(Buffer.from(bytes), {
    status: 200,
    headers: pdfDownloadHeaders(`${order.orderNumber}-challan.pdf`),
  });
}
