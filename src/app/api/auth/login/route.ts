import { loginSchema } from '@/schemas/auth.schema';
import { userStore } from '@/services/api/user-store';
import { setAuthCookies, signAccessToken, signRefreshToken } from '@/lib/auth';
import { errorResponse, internalErrorResponse, successResponse } from '@/lib/api-response';
import { getClientIp, rateLimit } from '@/lib/rate-limit';
import { sanitizeObjectStrings } from '@/lib/api-guard';
import { logger } from '@/lib/logger';

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const limited = rateLimit(`login:${ip}`, 20, 60_000);
    if (!limited.success) {
      return errorResponse('Too many login attempts. Try again later.', {
        status: 429,
        code: 'RATE_LIMITED',
      });
    }

    const body = sanitizeObjectStrings(await request.json());
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse('Validation failed', {
        status: 422,
        code: 'VALIDATION_ERROR',
        errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      });
    }

    const user = userStore.authenticate(parsed.data.email, parsed.data.password);
    if (!user) {
      logger.warn('Failed login attempt', { email: parsed.data.email, ip });
      return errorResponse('Invalid email or password', {
        status: 401,
        code: 'INVALID_CREDENTIALS',
      });
    }

    const accessToken = await signAccessToken(user);
    const refresh = await signRefreshToken(user.id);
    userStore.setRefreshJti(user.id, refresh.jti);
    await setAuthCookies(accessToken, refresh.token);

    logger.info('User logged in', { userId: user.id, ip });

    return successResponse(
      {
        user,
        message: 'Signed in successfully',
      },
      { message: 'Signed in successfully' },
    );
  } catch (error) {
    logger.error('Login failed', { error: error instanceof Error ? error.message : 'unknown' });
    return internalErrorResponse(error);
  }
}
