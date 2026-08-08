import { cookies } from 'next/headers';
import { COOKIE_NAMES } from '@/constants/cookies';
import { clearAuthCookies, verifyAccessToken } from '@/lib/auth';
import { userStore } from '@/services/api/user-store';
import { successResponse } from '@/lib/api-response';
import { logger } from '@/lib/logger';

export async function POST() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(COOKIE_NAMES.ACCESS_TOKEN)?.value;

  if (accessToken) {
    const session = await verifyAccessToken(accessToken);
    if (session) {
      userStore.setRefreshJti(session.sub, null);
      logger.info('User logged out', { userId: session.sub });
    }
  }

  await clearAuthCookies();
  return successResponse({ message: 'Signed out successfully' });
}
