import { resetPasswordSchema } from '@/schemas/auth.schema';
import { userStore } from '@/services/api/user-store';
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

    const ok = userStore.resetPassword(parsed.data.token, parsed.data.password);
    if (!ok) {
      return errorResponse('Invalid or expired reset token', {
        status: 400,
        code: 'INVALID_RESET_TOKEN',
      });
    }

    logger.info('Password reset completed', { ip });
    return successResponse({ message: 'Password updated successfully' });
  } catch (error) {
    return internalErrorResponse(error);
  }
}
