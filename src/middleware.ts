import { NextResponse, type NextRequest } from 'next/server';
import { applyAdminAuthMiddleware } from '@/middleware/admin-auth.middleware';
import { applyCustomerAuthMiddleware } from '@/middleware/customer-auth.middleware';
import { applyRoleMiddleware } from '@/middleware/role.middleware';
import { applySecurityMiddleware, validateCsrf } from '@/middleware/security.middleware';
import {
  ADMIN_AUTH_ROUTES,
  ADMIN_DEFAULT_LOGIN_REDIRECT,
  ADMIN_DEFAULT_LOGOUT_REDIRECT,
  ADMIN_ROUTES,
  ADMIN_ROUTE_PERMISSIONS,
  CUSTOMER_AUTH_ROUTES,
  CUSTOMER_DEFAULT_LOGIN_REDIRECT,
  CUSTOMER_DEFAULT_LOGOUT_REDIRECT,
  CUSTOMER_ROUTE_PERMISSIONS,
} from '@/constants/routes';

function pathMatches(pathname: string, route: string): boolean {
  return pathname === route || pathname.startsWith(`${route}/`);
}

function isAdminSurface(pathname: string): boolean {
  return (
    ADMIN_ROUTES.some((route) => pathMatches(pathname, route)) ||
    pathMatches(pathname, '/admin/login')
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // API CSRF validation for mutating requests
  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/health')) {
    const isPublicAuth =
      pathname === '/api/auth/customer/login' ||
      pathname === '/api/auth/customer/register' ||
      pathname === '/api/auth/admin/login' ||
      pathname === '/api/auth/forgot-password' ||
      pathname === '/api/auth/reset-password' ||
      pathname === '/api/csrf';

    if (!isPublicAuth && !validateCsrf(request)) {
      return NextResponse.json(
        { success: false, message: 'Invalid CSRF token', code: 'CSRF_INVALID' },
        { status: 403 },
      );
    }
  }

  // Admin surface: only ever consults the admin_session cookie + admin route table.
  if (isAdminSurface(pathname)) {
    const authResult = await applyAdminAuthMiddleware(request);
    if (authResult.response) return applySecurityMiddleware(request, authResult.response);

    // '/admin' (in ADMIN_ROUTE_PERMISSIONS) prefix-matches '/admin/login' too —
    // skip the permission check entirely on auth routes so login never
    // redirects to itself.
    const isAdminAuthRoute = ADMIN_AUTH_ROUTES.some((route) => pathMatches(pathname, route));
    const roleBlock = isAdminAuthRoute
      ? null
      : applyRoleMiddleware(
          request,
          authResult.session,
          ADMIN_ROUTE_PERMISSIONS,
          ADMIN_DEFAULT_LOGOUT_REDIRECT,
          ADMIN_DEFAULT_LOGIN_REDIRECT,
        );
    if (roleBlock) return applySecurityMiddleware(request, roleBlock);

    return applySecurityMiddleware(
      request,
      NextResponse.next({ request: { headers: request.headers } }),
    );
  }

  // Everything else (marketplace + customer account surface): only ever
  // consults the customer_session cookie + customer route table.
  const authResult = await applyCustomerAuthMiddleware(request);
  if (authResult.response) return applySecurityMiddleware(request, authResult.response);

  const isCustomerAuthRoute = CUSTOMER_AUTH_ROUTES.some((route) => pathMatches(pathname, route));
  const roleBlock = isCustomerAuthRoute
    ? null
    : applyRoleMiddleware(
        request,
        authResult.session,
        CUSTOMER_ROUTE_PERMISSIONS,
        CUSTOMER_DEFAULT_LOGOUT_REDIRECT,
        CUSTOMER_DEFAULT_LOGIN_REDIRECT,
      );
  if (roleBlock) return applySecurityMiddleware(request, roleBlock);

  return applySecurityMiddleware(
    request,
    NextResponse.next({ request: { headers: request.headers } }),
  );
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
