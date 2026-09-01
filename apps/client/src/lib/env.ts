import { z } from 'zod';

/**
 * Zod-validated environment configuration.
 * Fails fast at boot if required secrets/config are missing or invalid.
 */

const serverSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  NEXTAUTH_SECRET_CUSTOMER: z
    .string()
    .min(32, 'NEXTAUTH_SECRET_CUSTOMER must be at least 32 characters'),
  COOKIE_DOMAIN: z.string().default('localhost'),
  ALLOWED_ORIGINS: z.string().default('http://localhost:3000'),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(100),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

const clientSchema = z.object({
  NEXT_PUBLIC_APP_NAME: z.string().min(1).default('GoOrder'),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_APP_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  NEXT_PUBLIC_API_URL: z.string().url().default('http://localhost:3000/api'),
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

/**
 * Server-only env. Do not import from Client Components.
 */
export function getServerEnv(): ServerEnv {
  const parsed = serverSchema.safeParse({
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    NEXTAUTH_SECRET_CUSTOMER: process.env.NEXTAUTH_SECRET_CUSTOMER,
    COOKIE_DOMAIN: process.env.COOKIE_DOMAIN,
    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS,
    RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS,
    RATE_LIMIT_MAX_REQUESTS: process.env.RATE_LIMIT_MAX_REQUESTS,
    LOG_LEVEL: process.env.LOG_LEVEL,
  });

  if (!parsed.success) {
    if (isBuildPhase()) {
      return serverSchema.parse({
        NODE_ENV: process.env.NODE_ENV ?? 'production',
        DATABASE_URL: process.env.DATABASE_URL || 'postgresql://build:build@127.0.0.1:5432/build',
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
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  });

  if (!parsed.success) {
    throw new Error(`Invalid client environment variables:\n${formatZodError(parsed.error)}`);
  }

  return parsed.data;
}

export const clientEnv = getClientEnv();
