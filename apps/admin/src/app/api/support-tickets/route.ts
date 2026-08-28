import { PERMISSIONS } from '@/constants/roles';
import { isResponse, requirePermission, requireStaffSession } from '@/lib/api-guard';
import { prisma } from '@/lib/prisma';
import { serializeSupportTicket } from '@/lib/enterprise-mapper';
import { successResponse } from '@/lib/api-response';

export async function GET(request: Request) {
  const session = await requireStaffSession(request);
  if (isResponse(session)) return session;

  const allowed = requirePermission(session, PERMISSIONS.SUPPORT_READ);
  if (allowed !== true) return allowed;

  const tickets = await prisma.supportTicket.findMany({ orderBy: { updatedAt: 'desc' } });

  return successResponse({ tickets: tickets.map(serializeSupportTicket) });
}
