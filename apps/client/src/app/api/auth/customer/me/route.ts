import { isResponse, requireCustomerSession } from '@/lib/api-guard';
import { prisma } from '@/lib/prisma';
import { toPublicUser } from '@/lib/auth/shared';
import { errorResponse, successResponse } from '@/lib/api-response';

export async function GET(request: Request) {
  const session = await requireCustomerSession(request);
  if (isResponse(session)) return session;

  const user = await prisma.user.findUnique({ where: { id: session.sub } });
  if (!user) {
    return errorResponse('User not found', { status: 404, code: 'NOT_FOUND' });
  }

  return successResponse({ user: toPublicUser(user) });
}
