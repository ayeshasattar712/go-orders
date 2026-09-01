import { z } from 'zod';

/**
 * Zod-validated environment configuration.
 * Fails fast at boot if required secrets/config are missing or invalid.
 */

const serverSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  NEXTAUTH_SECRET_ADMIN: z.string().min(32, 'NEXTAUTH_SECRET_ADMIN must be at least 32 characters'),
  NEXTAUTH_SECRET_CUSTOMER: z
    .string()
    .min(32, 'NEXTAUTH_SECRET_CUSTOMER must be at least 32 characters'),
  COOKIE_DOMAIN: z.string().default('localhost'),
  ALLOWED_ORIGINS: z.string().default('http://localhost:3000'),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(100),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

const emptyToUndefined = (value: unknown) =>
  typeof value === 'string' && value.trim() === '' ? undefined : value;

const clientSchema = z.object({
  NEXT_PUBLIC_APP_NAME: z.preprocess(emptyToUndefined, z.string().min(1).default('GoOrder Admin')),
  NEXT_PUBLIC_APP_URL: z.preprocess(
    emptyToUndefined,
    z.string().url().default('http://localhost:3001'),
  ),
  NEXT_PUBLIC_APP_ENV: z.preprocess(
    emptyToUndefined,
    z.enum(['development', 'staging', 'production']).default('development'),
  ),
  NEXT_PUBLIC_API_URL: z.preprocess(
    emptyToUndefined,
    z.string().url().default('http://localhost:3001/api'),
  ),
});

export type ServerEnv = z.infer<typeof serverSchema>;
export type ClientEnv = z.infer<typeof clientSchema>;

function formatZodError(error: z.ZodError): string {
  return error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('\n');
}

function isBuildPhase(): boolean {
  return (
    process.env.NEXT_PHASE === 'phase-production-build' ||
    process.env.NEXT_PHASE === 'phase-production-compile'
  );
}

function blankToUndefined(value: string | undefined): string | undefined {
  if (value == null || value.trim() === '') return undefined;
  return value;
}

function defaultPublicAppUrl(): string | undefined {
  const explicit = blankToUndefined(process.env.NEXT_PUBLIC_APP_URL);
  if (explicit) return explicit;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return undefined;
}

function defaultPublicApiUrl(): string | undefined {
  const explicit = blankToUndefined(process.env.NEXT_PUBLIC_API_URL);
  if (explicit) return explicit;
  const appUrl = defaultPublicAppUrl();
  if (appUrl) return `${appUrl.replace(/\/$/, '')}/api`;
  return undefined;
}

function defaultPublicAppEnv(): string | undefined {
  const explicit = blankToUndefined(process.env.NEXT_PUBLIC_APP_ENV);
  if (explicit) return explicit;
  if (process.env.VERCEL_ENV === 'production') return 'production';
  if (process.env.VERCEL_ENV === 'preview') return 'staging';
  return undefined;
}

/**
 * Server-only env. Do not import from Client Components.
 */
export function getServerEnv(): ServerEnv {
  const parsed = serverSchema.safeParse({
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: blankToUndefined(process.env.DATABASE_URL),
    NEXTAUTH_SECRET_ADMIN: blankToUndefined(process.env.NEXTAUTH_SECRET_ADMIN),
    NEXTAUTH_SECRET_CUSTOMER: blankToUndefined(process.env.NEXTAUTH_SECRET_CUSTOMER),
    COOKIE_DOMAIN: blankToUndefined(process.env.COOKIE_DOMAIN),
    ALLOWED_ORIGINS: blankToUndefined(process.env.ALLOWED_ORIGINS),
    RATE_LIMIT_WINDOW_MS: blankToUndefined(process.env.RATE_LIMIT_WINDOW_MS),
    RATE_LIMIT_MAX_REQUESTS: blankToUndefined(process.env.RATE_LIMIT_MAX_REQUESTS),
    LOG_LEVEL: blankToUndefined(process.env.LOG_LEVEL),
  });

  if (!parsed.success) {
    if (isBuildPhase()) {
      return serverSchema.parse({
        NODE_ENV: process.env.NODE_ENV ?? 'production',
        DATABASE_URL: process.env.DATABASE_URL || 'postgresql://build:build@127.0.0.1:5432/build',
        NEXTAUTH_SECRET_ADMIN:
          process.env.NEXTAUTH_SECRET_ADMIN || 'vercel-build-placeholder-admin-secret-min-32',
        NEXTAUTH_SECRET_CUSTOMER:
          process.env.NEXTAUTH_SECRET_CUSTOMER || 'vercel-build-placeholder-secret-min-32-chars',
      });
    }
    throw new Error(`Invalid server environment variables:\n${formatZodError(parsed.error)}`);
  }

  return parsed.data;
}

/**
 * Public client env (NEXT_PUBLIC_* only).
 */
export function getClientEnv(): ClientEnv {
  const parsed = clientSchema.safeParse({
    NEXT_PUBLIC_APP_NAME: blankToUndefined(process.env.NEXT_PUBLIC_APP_NAME),
    NEXT_PUBLIC_APP_URL: defaultPublicAppUrl(),
    NEXT_PUBLIC_APP_ENV: defaultPublicAppEnv(),
    NEXT_PUBLIC_API_URL: defaultPublicApiUrl(),
  });

  if (!parsed.success) {
    throw new Error(`Invalid client environment variables:\n${formatZodError(parsed.error)}`);
  }

  return parsed.data;
}

export const clientEnv = getClientEnv();
