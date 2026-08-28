import { PERMISSIONS } from '@/constants/roles';
import { isResponse, requirePermission, requireStaffSession } from '@/lib/api-guard';
import { prisma } from '@/lib/prisma';
import { serializeClient } from '@/lib/enterprise-mapper';
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
      joinedAt: new Date(),
    },
    include: { addresses: true },
  });

  return successResponse({ client: serializeClient(client) }, { status: 201 });
}
