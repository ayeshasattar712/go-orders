import { registerSchema } from '@/schemas/auth.schema';
import { userStore } from '@/services/api/user-store';
import { setAuthCookies, signAccessToken, signRefreshToken } from '@/lib/auth';
import { errorResponse, internalErrorResponse, successResponse } from '@/lib/api-response';
import { getClientIp, rateLimit } from '@/lib/rate-limit';
import { sanitizeObjectStrings } from '@/lib/api-guard';
import { logger } from '@/lib/logger';

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const limited = rateLimit(`register:${ip}`, 10, 60_000);
    if (!limited.success) {
      return errorResponse('Too many registration attempts.', {
        status: 429,
        code: 'RATE_LIMITED',
      });
    }

    const body = sanitizeObjectStrings(await request.json());
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse('Validation failed', {
        status: 422,
        code: 'VALIDATION_ERROR',
        errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      });
    }

    if (userStore.findByEmail(parsed.data.email)) {
      return errorResponse('Email already registered', {
        status: 409,
        code: 'EMAIL_EXISTS',
      });
    }

    const user = userStore.create({
      email: parsed.data.email,
      password: parsed.data.password,
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
    });

    const accessToken = await signAccessToken(user);
    const refresh = await signRefreshToken(user.id);
    userStore.setRefreshJti(user.id, refresh.jti);
    await setAuthCookies(accessToken, refresh.token);

    logger.info('User registered', { userId: user.id, ip });

    return successResponse(
      {
        user,
        message: 'Account created successfully',
      },
      { status: 201, message: 'Account created successfully' },
    );
  } catch (error) {
    logger.error('Registration failed', {
      error: error instanceof Error ? error.message : 'unknown',
    });
    return internalErrorResponse(error);
  }
}
