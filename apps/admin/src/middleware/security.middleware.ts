import { NextResponse, type NextRequest } from 'next/server';
import { COOKIE_NAMES } from '@/constants/cookies';

function buildCsp(isDev: boolean): string {
  // Do not put a per-request nonce + 'strict-dynamic' on prerendered pages.
  // 'strict-dynamic' ignores 'self', and a nonce that is not on Next.js
  // bootstrap scripts blocks hydration — login stays on <Suspense> "Loading...".
  const scriptSrc = isDev ? `'self' 'unsafe-inline' 'unsafe-eval'` : `'self' 'unsafe-inline'`;

  return [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self' https:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ].join('; ');
}

function isAllowedOriginHeader(request: NextRequest, origin: string): boolean {
  // Same-origin POSTs (login on Vercel) must always pass. ALLOWED_ORIGINS
  // defaults to localhost, which would 403 every mutating request in production.
  if (origin === request.nextUrl.origin) return true;

  const configured = (process.env.ALLOWED_ORIGINS ?? 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  if (configured.includes(origin)) return true;

  const vercelHost = process.env.VERCEL_URL;
  if (vercelHost && origin === `https://${vercelHost}`) return true;

  const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (productionHost && origin === `https://${productionHost}`) return true;

  return false;
}

/**
 * Applies security headers, CSRF cookie, and origin checks.
 */
export function applySecurityMiddleware(
  request: NextRequest,
  response: NextResponse,
): NextResponse {
  const isDev = process.env.NODE_ENV !== 'production';

  response.headers.set('Content-Security-Policy', buildCsp(isDev));
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  const csrf = request.cookies.get(COOKIE_NAMES.CSRF_TOKEN)?.value;
  if (!csrf) {
    const tokenBytes = new Uint8Array(32);
    crypto.getRandomValues(tokenBytes);
    const token = Array.from(tokenBytes, (b) => b.toString(16).padStart(2, '0')).join('');
    response.cookies.set(COOKIE_NAMES.CSRF_TOKEN, token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24,
    });
  }

  const origin = request.headers.get('origin');
  const method = request.method.toUpperCase();
  if (origin && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    if (!isAllowedOriginHeader(request, origin)) {
      return NextResponse.json(
        { success: false, message: 'Origin not allowed', code: 'ORIGIN_FORBIDDEN' },
        { status: 403 },
      );
    }
  }

  return response;
}

export function validateCsrf(request: NextRequest): boolean {
  const method = request.method.toUpperCase();
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) return true;

  // Skip CSRF for refresh token rotation (cookie-auth only, same-site)
  if (request.nextUrl.pathname === '/api/auth/refresh') return true;

  const cookieToken = request.cookies.get(COOKIE_NAMES.CSRF_TOKEN)?.value;
  const headerToken = request.headers.get('x-csrf-token');

  if (!cookieToken || !headerToken) return false;
  return cookieToken === headerToken;
}
