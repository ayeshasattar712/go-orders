import { CreditTerms } from '@prisma/client';
import { PERMISSIONS } from '@/constants/roles';
import { isResponse, requirePermission, requireStaffSession } from '@/lib/api-guard';
import { prisma } from '@/lib/prisma';
import { CREDIT_TERMS_FROM_STRING, serializeClient } from '@/lib/enterprise-mapper';
import { successResponse } from '@/lib/api-response';

export async function GET(request: Request) {
  const session = await requireStaffSession(request);
  if (isResponse(session)) return session;

  const allowed = requirePermission(session, PERMISSIONS.CLIENTS_READ);
  if (allowed !== true) return allowed;

  const clients = await prisma.client.findMany({
    include: { addresses: true },
    orderBy: { companyName: 'asc' },
  });

  return successResponse({ clients: clients.map(serializeClient) });
}

export async function POST(request: Request) {
  const session = await requireStaffSession(request);
  if (isResponse(session)) return session;

  const allowed = requirePermission(session, PERMISSIONS.CLIENTS_WRITE);
  if (allowed !== true) return allowed;

  const body = await request.json();
  const client = await prisma.client.create({
    data: {
      companyName: body.companyName,
      contactName: body.contactName,
      email: String(body.email ?? '').toLowerCase(),
      phone: body.phone || '—',
      address: body.address || '—',
      status: body.status === 'suspended' ? 'SUSPENDED' : 'ACTIVE',
      creditLimit: Number(body.creditLimit ?? 0),
      creditTerms:
        typeof body.creditTerms === 'string' && body.creditTerms in CREDIT_TERMS_FROM_STRING
          ? CREDIT_TERMS_FROM_STRING[body.creditTerms as keyof typeof CREDIT_TERMS_FROM_STRING]
          : CreditTerms.NET_30,
      joinedAt: new Date(),
    },
    include: { addresses: true },
  });

  return successResponse({ client: serializeClient(client) }, { status: 201 });
}
