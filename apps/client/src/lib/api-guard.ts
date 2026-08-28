import { getCustomerSession } from '@/lib/auth/customer-auth';
import type { AppSessionToken } from '@/lib/auth/session';
import { hasAnyPermission, hasPermission } from '@/lib/permissions';
import { getClientIp, rateLimit } from '@/lib/rate-limit';
import { assertSafeInput, sanitizeText } from '@/lib/security';
import { errorResponse } from '@/lib/api-response';
import type { Permission } from '@/constants/roles';

async function guardSession(
  request: Request,
  getSession: () => Promise<AppSessionToken | null>,
): Promise<AppSessionToken | Response> {
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

  const session = await getSession();
  if (!session) {
    return errorResponse('Unauthorized', { status: 401, code: 'UNAUTHORIZED' });
  }

  return session;
}

/** Only ever resolves a customer_session — never accepts an admin session. */
export function requireCustomerSession(request: Request): Promise<AppSessionToken | Response> {
  return guardSession(request, getCustomerSession);
}

export function requirePermissions(
  session: AppSessionToken,
  permissions: Permission[],
): true | Response {
  if (!hasAnyPermission(session, permissions)) {
    return errorResponse('Forbidden', { status: 403, code: 'FORBIDDEN' });
  }
  return true;
}

export function requirePermission(
  session: AppSessionToken,
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
