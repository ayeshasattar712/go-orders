import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { COOKIE_NAMES } from '@/constants/cookies';
import {
  AUTH_ROUTES,
  DEFAULT_LOGIN_REDIRECT,
  DEFAULT_LOGOUT_REDIRECT,
  PROTECTED_ROUTES,
} from '@/constants/routes';
import type { JwtAccessPayload } from '@/types/auth';

async function verifyAccess(token: string): Promise<JwtAccessPayload | null> {
  try {
    const secret = process.env.JWT_ACCESS_SECRET;
    if (!secret) return null;
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    if (payload.type !== 'access' || typeof payload.sub !== 'string') return null;
    return payload as unknown as JwtAccessPayload;
  } catch {
    return null;
  }
}

function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export interface AuthMiddlewareResult {
  response?: NextResponse;
  session: JwtAccessPayload | null;
}

/**
 * Protects dashboard routes and redirects authenticated users away from auth pages.
 */
export async function applyAuthMiddleware(request: NextRequest): Promise<AuthMiddlewareResult> {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get(COOKIE_NAMES.ACCESS_TOKEN)?.value;
  const session = accessToken ? await verifyAccess(accessToken) : null;

  if (isProtectedRoute(pathname) && !session) {
    const loginUrl = new URL(DEFAULT_LOGOUT_REDIRECT, request.url);
    loginUrl.searchParams.set('next', pathname);
    return { response: NextResponse.redirect(loginUrl), session: null };
  }

  if (isAuthRoute(pathname) && session) {
    return {
      response: NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, request.url)),
      session,
    };
  }

  return { session };
}
