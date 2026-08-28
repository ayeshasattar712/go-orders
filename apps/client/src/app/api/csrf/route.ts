import { cookies } from 'next/headers';
import { COOKIE_MAX_AGE, COOKIE_NAMES } from '@/constants/cookies';
import { generateCsrfToken } from '@/lib/security';
import { sessionCookieOptions } from '@/lib/auth/session';
import { successResponse } from '@/lib/api-response';

export async function GET() {
  const token = generateCsrfToken();
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAMES.CSRF_TOKEN, token, {
    ...sessionCookieOptions(COOKIE_MAX_AGE.CSRF_TOKEN),
    httpOnly: false,
  });

  return successResponse({ csrfToken: token });
}
