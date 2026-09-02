import { createHash, randomBytes, timingSafeEqual } from 'crypto';

/**
 * Application security utilities:
 * - Input sanitization (XSS)
 * - CSRF token helpers
 * - Nonce / CSP helpers
 * - Safe comparison
 *
 * Avoid isomorphic-dompurify/jsdom here — loading it in a Vercel serverless
 * function crashes auth routes with an empty 500.
 */

export function sanitizeHtml(dirty: string): string {
  return dirty
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/\son\w+="[^"]*"/gi, '')
    .replace(/javascript:/gi, '');
}

export function sanitizeText(input: string): string {
  return input.replace(/<\/?[^>]+>/g, '').trim();
}

export function generateNonce(bytes = 16): string {
  return randomBytes(bytes).toString('base64');
}

export function generateCsrfToken(): string {
  return randomBytes(32).toString('hex');
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/**
 * Basic SQL injection pattern detection for free-text inputs.
 * Prefer parameterized queries / ORMs for real data access.
 */
const SQL_INJECTION_PATTERN =
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|TRUNCATE|EXEC|EXECUTE)\b)|(--|;\/\*|\*\/|xp_)/i;

export function containsSqlInjection(value: string): boolean {
  return SQL_INJECTION_PATTERN.test(value);
}

export function assertSafeInput(value: string, field = 'input'): void {
  if (containsSqlInjection(value)) {
    throw new Error(`Potentially unsafe content detected in ${field}`);
  }
}

export function buildCspHeader(nonce: string, isDev: boolean): string {
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
    "media-src 'self' blob: https:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    'upgrade-insecure-requests',
  ].join('; ');
}

export function getAllowedOrigins(): string[] {
  return (process.env.ALLOWED_ORIGINS ?? 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  return getAllowedOrigins().includes(origin);
}
