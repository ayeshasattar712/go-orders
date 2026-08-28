import { successResponse } from '@/lib/api-response';

export async function GET() {
  return successResponse({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: process.env.NEXT_PUBLIC_APP_ENV ?? 'development',
  });
}
