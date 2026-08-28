import { ClientStatus } from '@prisma/client';
import { PERMISSIONS } from '@/constants/roles';
import { isResponse, requirePermission, requireStaffSession } from '@/lib/api-guard';
import { prisma } from '@/lib/prisma';
import { serializeClient } from '@/lib/enterprise-mapper';
import { errorResponse, successResponse } from '@/lib/api-response';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireStaffSession(request);
  if (isResponse(session)) return session;

  const allowed = requirePermission(session, PERMISSIONS.CLIENTS_WRITE);
  if (allowed !== true) return allowed;

  const { id } = await params;
  const body = (await request.json()) as {
    status?: 'active' | 'suspended';
    creditLimit?: number;
    creditFrozen?: boolean;
  };

  const client = await prisma.client.findUnique({ where: { id }, include: { addresses: true } });
  if (!client) {
    return errorResponse('Client not found', { status: 404, code: 'NOT_FOUND' });
  }

  const updated = await prisma.client.update({
    where: { id },
    data: {
      ...(body.status === 'active' ? { status: ClientStatus.ACTIVE } : {}),
      ...(body.status === 'suspended' ? { status: ClientStatus.SUSPENDED } : {}),
      ...(typeof body.creditLimit === 'number' ? { creditLimit: body.creditLimit } : {}),
      ...(typeof body.creditFrozen === 'boolean' ? { creditFrozen: body.creditFrozen } : {}),
    },
    include: { addresses: true },
  });

  return successResponse({ client: serializeClient(updated) });
}
