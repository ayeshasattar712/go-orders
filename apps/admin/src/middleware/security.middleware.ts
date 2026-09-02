import { NextResponse, type NextRequest } from 'next/server';
import { COOKIE_NAMES } from '@/constants/cookies';

function generateNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes));
}

function buildCsp(nonce: string, isDev: boolean): string {
  const scriptSrc = isDev
    ? `'self' 'nonce-${nonce}' 'unsafe-eval'`
    : `'self' 'nonce-${nonce}' 'strict-dynamic'`;

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
 * Applies security headers, CSP nonce, CSRF cookie, and origin checks.
 */
export function applySecurityMiddleware(
  request: NextRequest,
  response: NextResponse,
): NextResponse {
  const nonce = generateNonce();
  const isDev = process.env.NODE_ENV !== 'production';

  response.headers.set('Content-Security-Policy', buildCsp(nonce, isDev));
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set('X-Nonce', nonce);

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
