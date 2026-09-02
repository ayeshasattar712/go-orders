import { NextResponse } from 'next/server';
import type { ApiErrorResponse, ApiSuccessResponse } from '@/types/api';

export function successResponse<T>(
  data: T,
  init?: { status?: number; message?: string; headers?: HeadersInit },
) {
  const body: ApiSuccessResponse<T> = {
    success: true,
    data,
    ...(init?.message ? { message: init.message } : {}),
  };

  return NextResponse.json(body, {
    status: init?.status ?? 200,
    headers: init?.headers,
  });
}

export function errorResponse(
  message: string,
  init?: {
    status?: number;
    code?: string;
    errors?: Record<string, string[]>;
    headers?: HeadersInit;
  },
) {
  const body: ApiErrorResponse = {
    success: false,
    message,
    ...(init?.code ? { code: init.code } : {}),
    ...(init?.errors ? { errors: init.errors } : {}),
  };

  return NextResponse.json(body, {
    status: init?.status ?? 400,
    headers: init?.headers,
  });
}

/**
 * Never leak stack traces or internal details to clients.
 */
function isInfraError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /DATABASE_URL|NEXTAUTH_SECRET|Can't reach database|P1001|P1017|P1000|Environment variable not found|Invalid server environment/i.test(
    message,
  );
}

export function internalErrorResponse(error: unknown) {
  if (isInfraError(error)) {
    return errorResponse(
      'Database or auth secrets are not configured. Set DATABASE_URL and NEXTAUTH secrets in Vercel (hosted Postgres, not localhost).',
      { status: 503, code: 'MISCONFIGURED' },
    );
  }

  if (process.env.NODE_ENV === 'development') {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return errorResponse(message, { status: 500, code: 'INTERNAL_ERROR' });
  }

  return errorResponse('An unexpected error occurred', {
    status: 500,
    code: 'INTERNAL_ERROR',
  });
}
