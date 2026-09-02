import { loginSchema } from '@/schemas/auth.schema';
import { authenticate, toPublicUser } from '@/lib/auth/shared';
import { setAdminSessionCookie } from '@/lib/auth/admin-auth';
import { errorResponse, internalErrorResponse, successResponse } from '@/lib/api-response';
import { getClientIp, rateLimit } from '@/lib/rate-limit';
import { sanitizeObjectStrings } from '@/lib/api-guard';
import { logger } from '@/lib/logger';
import { getServerEnv } from '@/lib/env';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    getServerEnv();
    const ip = getClientIp(request);
    const limited = rateLimit(`login:admin:${ip}`, 20, 60_000);
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

    const user = await authenticate(parsed.data.email, parsed.data.password, 'STAFF');
    if (!user) {
      logger.warn('Failed admin login attempt', { email: parsed.data.email, ip });
      return errorResponse('Invalid email or password', {
        status: 401,
        code: 'INVALID_CREDENTIALS',
      });
    }

    const publicUser = toPublicUser(user);
    await setAdminSessionCookie(publicUser);

    logger.info('Staff member logged in', { userId: user.id, ip });

    return successResponse(
      { user: publicUser, message: 'Signed in successfully' },
      { message: 'Signed in successfully' },
    );
  } catch (error) {
    logger.error('Admin login failed', {
      error: error instanceof Error ? error.message : 'unknown',
    });
    return internalErrorResponse(error);
  }
}
