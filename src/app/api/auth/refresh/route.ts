import { cookies } from 'next/headers';
import { COOKIE_NAMES } from '@/constants/cookies';
import {
  setAuthCookies,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '@/lib/auth';
import { userStore } from '@/services/api/user-store';
import { errorResponse, internalErrorResponse, successResponse } from '@/lib/api-response';
import { logger } from '@/lib/logger';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get(COOKIE_NAMES.REFRESH_TOKEN)?.value;

    if (!refreshToken) {
      return errorResponse('Refresh token missing', { status: 401, code: 'UNAUTHORIZED' });
    }

    const payload = await verifyRefreshToken(refreshToken);
    if (!payload) {
      return errorResponse('Invalid refresh token', { status: 401, code: 'INVALID_REFRESH' });
    }

    if (!userStore.validateRefreshJti(payload.sub, payload.jti)) {
      // Possible reuse — revoke
      userStore.setRefreshJti(payload.sub, null);
      logger.warn('Refresh token reuse detected', { userId: payload.sub });
      return errorResponse('Refresh token revoked', { status: 401, code: 'REFRESH_REVOKED' });
    }

    const user = userStore.findById(payload.sub);
    if (!user || !user.isActive) {
      return errorResponse('User not found', { status: 401, code: 'UNAUTHORIZED' });
    }

    const publicUser = userStore.toPublicUser(user);
    const accessToken = await signAccessToken(publicUser);
    const refresh = await signRefreshToken(publicUser.id);
    userStore.setRefreshJti(publicUser.id, refresh.jti);
    await setAuthCookies(accessToken, refresh.token);

    return successResponse({ accessToken });
  } catch (error) {
    return internalErrorResponse(error);
  }
}
