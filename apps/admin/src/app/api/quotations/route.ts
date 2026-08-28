import { isResponse, requireCustomerSession } from '@/lib/api-guard';
import { prisma } from '@/lib/prisma';
import { serializeQuotation } from '@/lib/enterprise-mapper';
import { successResponse } from '@/lib/api-response';

export async function GET(request: Request) {
  const session = await requireCustomerSession(request);
  if (isResponse(session)) return session;

  const client = await prisma.client.findFirst({
    where: { userId: session.sub },
  });

  if (!client) {
    return successResponse({ quotations: [] });
  }

  const quotations = await prisma.quotation.findMany({
    where: { clientId: client.id },
    orderBy: { requestedAt: 'desc' },
  });

  return successResponse({ quotations: quotations.map(serializeQuotation) });
}
