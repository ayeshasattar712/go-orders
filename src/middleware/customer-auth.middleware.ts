import { NextResponse, type NextRequest } from 'next/server';
import { getCustomerSessionFromRequest } from '@/lib/auth/customer-auth';
import {
  CUSTOMER_AUTH_ROUTES,
  CUSTOMER_DEFAULT_LOGIN_REDIRECT,
  CUSTOMER_DEFAULT_LOGOUT_REDIRECT,
  CUSTOMER_ROUTES,
} from '@/constants/routes';
import type { AppSessionToken } from '@/lib/auth/session';

function pathMatches(pathname: string, route: string): boolean {
  return pathname === route || pathname.startsWith(`${route}/`);
}

export interface SurfaceAuthResult {
  response?: NextResponse;
  session: AppSessionToken | null;
}

/** Only ever reads/validates the customer_session cookie — never the admin one. */
export async function applyCustomerAuthMiddleware(
  request: NextRequest,
): Promise<SurfaceAuthResult> {
  const { pathname } = request.nextUrl;
  const isAuthRoute = CUSTOMER_AUTH_ROUTES.some((route) => pathMatches(pathname, route));
  // Auth routes always take precedence over the protected-route table, in
  // case of future prefix overlap (mirrors the admin surface's guard).
  const isProtected = !isAuthRoute && CUSTOMER_ROUTES.some((route) => pathMatches(pathname, route));

  if (!isProtected && !isAuthRoute) {
    return { session: null };
  }

  const session = await getCustomerSessionFromRequest(request);

  if (isProtected && !session) {
    const loginUrl = new URL(CUSTOMER_DEFAULT_LOGOUT_REDIRECT, request.url);
    loginUrl.searchParams.set('next', pathname);
    return { response: NextResponse.redirect(loginUrl), session: null };
  }

  if (isAuthRoute && session) {
    return {
      response: NextResponse.redirect(new URL(CUSTOMER_DEFAULT_LOGIN_REDIRECT, request.url)),
      session,
    };
  }

  return { session };
}
