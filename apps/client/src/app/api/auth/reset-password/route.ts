import { resetPasswordSchema } from '@/schemas/auth.schema';
import { hashPassword } from '@/lib/auth/shared';
import { hashToken } from '@/lib/security';
import { prisma } from '@/lib/prisma';
import { errorResponse, internalErrorResponse, successResponse } from '@/lib/api-response';
import { getClientIp, rateLimit } from '@/lib/rate-limit';
import { sanitizeObjectStrings } from '@/lib/api-guard';
import { logger } from '@/lib/logger';

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const limited = rateLimit(`reset:${ip}`, 10, 60_000);
    if (!limited.success) {
      return errorResponse('Too many requests', { status: 429, code: 'RATE_LIMITED' });
    }

    const body = sanitizeObjectStrings(await request.json());
    const parsed = resetPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse('Validation failed', {
        status: 422,
        code: 'VALIDATION_ERROR',
        errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      });
    }

    const tokenHash = hashToken(parsed.data.token);
    const user = await prisma.user.findFirst({
      where: { resetTokenHash: tokenHash, resetTokenExpiresAt: { gt: new Date() } },
    });

    if (!user) {
      return errorResponse('Invalid or expired reset token', {
        status: 400,
        code: 'INVALID_RESET_TOKEN',
      });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: await hashPassword(parsed.data.password),
        resetTokenHash: null,
        resetTokenExpiresAt: null,
      },
    });

    logger.info('Password reset completed', { userId: user.id, ip });
    return successResponse({ message: 'Password updated successfully' });
  } catch (error) {
    return internalErrorResponse(error);
  }
}
