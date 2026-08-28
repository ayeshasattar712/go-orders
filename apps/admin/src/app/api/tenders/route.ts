import { PERMISSIONS } from '@/constants/roles';
import { isResponse, requirePermission, requireStaffSession } from '@/lib/api-guard';
import { prisma } from '@/lib/prisma';
import { serializeTender, serializeBid, serializeRfqRequest } from '@/lib/enterprise-mapper';
import { successResponse } from '@/lib/api-response';

export async function GET(request: Request) {
  const session = await requireStaffSession(request);
  if (isResponse(session)) return session;

  const allowed = requirePermission(session, PERMISSIONS.TENDERS_READ);
  if (allowed !== true) return allowed;

  const tenders = await prisma.tender.findMany({
    include: { bids: { where: { tenderId: { not: null } } } },
    orderBy: { deadline: 'desc' },
  });

  const rfqs = await prisma.rfqRequest.findMany({
    include: { bids: true },
    orderBy: { createdAt: 'desc' },
  });

  const bidsByTender: Record<string, Bid[]> = {};
  for (const tender of tenders) {
    if (tender.bids.length > 0) {
      bidsByTender[tender.id] = tender.bids.map(serializeBid);
    }
  }

  const quotesByRfq: Record<string, Bid[]> = {};
  for (const rfq of rfqs) {
    if (rfq.bids.length > 0) {
      quotesByRfq[rfq.id] = rfq.bids.map(serializeBid);
    }
  }

  return successResponse({
    tenders: tenders.map(serializeTender),
    bidsByTender,
    quotesByRfq,
    rfqs: rfqs.map(serializeRfqRequest),
  });
}

export async function POST(request: Request) {
  const session = await requireStaffSession(request);
  if (isResponse(session)) return session;

  const allowed = requirePermission(session, PERMISSIONS.TENDERS_WRITE);
  if (allowed !== true) return allowed;

  const body = await request.json();
  const tender = await prisma.tender.create({
    data: {
      ...body,
      status: body.status ? body.status.toUpperCase() : 'OPEN',
      deadline: new Date(body.deadline),
    },
  });

  return successResponse({ tender: serializeTender(tender) }, { status: 201 });
}
