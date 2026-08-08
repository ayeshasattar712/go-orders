import { cookies } from 'next/headers';
import { COOKIE_NAMES } from '@/constants/cookies';
import { generateCsrfToken } from '@/lib/security';
import { getSecureCookieOptions } from '@/lib/auth';
import { COOKIE_MAX_AGE } from '@/constants/cookies';
import { successResponse } from '@/lib/api-response';

export async function GET() {
  const token = generateCsrfToken();
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAMES.CSRF_TOKEN, token, {
    ...getSecureCookieOptions(COOKIE_MAX_AGE.CSRF_TOKEN),
    httpOnly: false,
  });

  return successResponse({ csrfToken: token });
}
