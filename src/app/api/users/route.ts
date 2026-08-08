import { PERMISSIONS } from '@/constants/roles';
import { isResponse, requireAuth, requirePermission } from '@/lib/api-guard';
import { userStore } from '@/services/api/user-store';
import { successResponse } from '@/lib/api-response';

export async function GET(request: Request) {
  const session = await requireAuth(request);
  if (isResponse(session)) return session;

  const allowed = requirePermission(session, PERMISSIONS.USERS_READ);
  if (allowed !== true) return allowed;

  return successResponse({ users: userStore.list() });
}
