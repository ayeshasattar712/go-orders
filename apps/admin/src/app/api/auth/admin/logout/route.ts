import { clearAdminSessionCookie, getAdminSession } from '@/lib/auth/admin-auth';
import { successResponse } from '@/lib/api-response';
import { logger } from '@/lib/logger';

export async function POST() {
  const session = await getAdminSession();
  if (session) {
    logger.info('Staff member logged out', { userId: session.sub });
  }

  await clearAdminSessionCookie();
  return successResponse({ message: 'Signed out successfully' });
}
