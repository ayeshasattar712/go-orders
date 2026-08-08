import { isResponse, requireAuth } from '@/lib/api-guard';
import { userStore } from '@/services/api/user-store';
import { errorResponse, successResponse } from '@/lib/api-response';

export async function GET(request: Request) {
  const session = await requireAuth(request);
  if (isResponse(session)) return session;

  const user = userStore.findById(session.sub);
  if (!user) {
    return errorResponse('User not found', { status: 404, code: 'NOT_FOUND' });
  }

  return successResponse({ user: userStore.toPublicUser(user) });
}
