import { PERMISSIONS } from '@/constants/roles';
import { isResponse, requirePermission, requireStaffSession } from '@/lib/api-guard';
import { prisma } from '@/lib/prisma';
import { toPublicUser } from '@/lib/auth/shared';
import { successResponse } from '@/lib/api-response';

export async function GET(request: Request) {
  const session = await requireStaffSession(request);
  if (isResponse(session)) return session;

  const allowed = requirePermission(session, PERMISSIONS.USERS_READ);
  if (allowed !== true) return allowed;

  const users = await prisma.user.findMany({ where: { userType: 'STAFF' } });
  return successResponse({ users: users.map(toPublicUser) });
}
