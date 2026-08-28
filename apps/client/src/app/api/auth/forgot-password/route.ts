import { randomBytes } from 'crypto';
import { forgotPasswordSchema } from '@/schemas/auth.schema';
import { hashToken } from '@/lib/security';
import { prisma } from '@/lib/prisma';
import { errorResponse, internalErrorResponse, successResponse } from '@/lib/api-response';
import { getClientIp, rateLimit } from '@/lib/rate-limit';
import { sanitizeObjectStrings } from '@/lib/api-guard';
import { logger } from '@/lib/logger';

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const limited = rateLimit(`forgot:${ip}`, 10, 60_000);
    if (!limited.success) {
      return errorResponse('Too many requests', { status: 429, code: 'RATE_LIMITED' });
    }

    const body = sanitizeObjectStrings(await request.json());
    const parsed = forgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse('Validation failed', {
        status: 422,
        code: 'VALIDATION_ERROR',
        errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      });
    }

    const email = parsed.data.email.toLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });
    // Always return a generic message to prevent account enumeration.
    const genericMessage =
      'If an account exists for that email, password reset instructions have been sent.';

    let devResetPath: string | undefined;
    if (user) {
      const token = randomBytes(32).toString('hex');
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetTokenHash: hashToken(token),
          resetTokenExpiresAt: new Date(Date.now() + 1000 * 60 * 30),
        },
      });
      if (process.env.NODE_ENV === 'development') {
        devResetPath = `/reset-password?token=${token}`;
      }
      logger.info('Password reset requested', { userId: user.id });
    }

    return successResponse({
      message: genericMessage,
      ...(devResetPath ? { devResetPath } : {}),
    });
  } catch (error) {
    return internalErrorResponse(error);
  }
}
