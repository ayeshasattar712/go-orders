import { successResponse } from '@/lib/api-response';

export const runtime = 'nodejs';

export async function GET() {
  const databaseUrl = process.env.DATABASE_URL ?? '';

  return successResponse({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: process.env.NEXT_PUBLIC_APP_ENV ?? 'development',
    databaseConfigured: Boolean(databaseUrl),
    databaseIsLocalhost: /localhost|127\.0\.0\.1/.test(databaseUrl),
    adminSecretConfigured: Boolean(process.env.NEXTAUTH_SECRET_ADMIN),
  });
}
