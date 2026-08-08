import { cookies } from 'next/headers';
import { COOKIE_NAMES } from '@/constants/cookies';
import { verifyAccessToken } from '@/lib/auth';
import { hasAnyPermission, hasPermission } from '@/lib/permissions';
import { getClientIp, rateLimit } from '@/lib/rate-limit';
import { assertSafeInput, sanitizeText } from '@/lib/security';
import { errorResponse } from '@/lib/api-response';
import type { Permission } from '@/constants/roles';
import type { JwtAccessPayload } from '@/types/auth';

export async function requireAuth(request: Request): Promise<JwtAccessPayload | Response> {
  const ip = getClientIp(request);
  const limited = rateLimit(`api:${ip}`);
  if (!limited.success) {
    return errorResponse('Too many requests', {
      status: 429,
      code: 'RATE_LIMITED',
      headers: {
        'Retry-After': String(Math.ceil((limited.resetAt - Date.now()) / 1000)),
      },
    });
  }

  const cookieStore = await cookies();
  const bearer = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  const cookieToken = cookieStore.get(COOKIE_NAMES.ACCESS_TOKEN)?.value;
  const token = bearer || cookieToken;

  if (!token) {
    return errorResponse('Unauthorized', { status: 401, code: 'UNAUTHORIZED' });
  }

  const session = await verifyAccessToken(token);
  if (!session) {
    return errorResponse('Session expired', { status: 401, code: 'SESSION_EXPIRED' });
  }

  return session;
}

export function requirePermissions(
  session: JwtAccessPayload,
  permissions: Permission[],
): true | Response {
  if (!hasAnyPermission(session, permissions)) {
    return errorResponse('Forbidden', { status: 403, code: 'FORBIDDEN' });
  }
  return true;
}

export function requirePermission(
  session: JwtAccessPayload,
  permission: Permission,
): true | Response {
  if (!hasPermission(session, permission)) {
    return errorResponse('Forbidden', { status: 403, code: 'FORBIDDEN' });
  }
  return true;
}

export function sanitizeObjectStrings<T extends Record<string, unknown>>(input: T): T {
  const output = { ...input };
  for (const [key, value] of Object.entries(output)) {
    if (typeof value === 'string') {
      assertSafeInput(value, key);
      (output as Record<string, unknown>)[key] = sanitizeText(value);
    }
  }
  return output;
}

export function isResponse(value: unknown): value is Response {
  return value instanceof Response;
}
