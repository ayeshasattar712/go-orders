import { NextResponse, type NextRequest } from 'next/server';
import { getAdminSessionFromRequest } from '@/lib/auth/admin-auth';
import {
  ADMIN_AUTH_ROUTES,
  ADMIN_DEFAULT_LOGIN_REDIRECT,
  ADMIN_DEFAULT_LOGOUT_REDIRECT,
  ADMIN_ROUTES,
} from '@/constants/routes';
import type { SurfaceAuthResult } from '@/middleware/customer-auth.middleware';

function pathMatches(pathname: string, route: string): boolean {
  return pathname === route || pathname.startsWith(`${route}/`);
}

/** Only ever reads/validates the admin_session cookie — never the customer one. */
export async function applyAdminAuthMiddleware(request: NextRequest): Promise<SurfaceAuthResult> {
  const { pathname } = request.nextUrl;
  const isAuthRoute = ADMIN_AUTH_ROUTES.some((route) => pathMatches(pathname, route));
  // '/admin' (in ADMIN_ROUTES) prefix-matches '/admin/login' too — auth routes
  // always take precedence so the login page never redirects to itself.
  const isProtected = !isAuthRoute && ADMIN_ROUTES.some((route) => pathMatches(pathname, route));

  if (!isProtected && !isAuthRoute) {
    return { session: null };
  }

  const session = await getAdminSessionFromRequest(request);

  if (isProtected && !session) {
    const loginUrl = new URL(ADMIN_DEFAULT_LOGOUT_REDIRECT, request.url);
    loginUrl.searchParams.set('next', pathname);
    return { response: NextResponse.redirect(loginUrl), session: null };
  }

  if (isAuthRoute && session) {
    return {
      response: NextResponse.redirect(new URL(ADMIN_DEFAULT_LOGIN_REDIRECT, request.url)),
      session,
    };
  }

  return { session };
}
