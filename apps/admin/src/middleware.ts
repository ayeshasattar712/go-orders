import { NextResponse, type NextRequest } from 'next/server';
import { applyAdminAuthMiddleware } from '@/middleware/admin-auth.middleware';
import { applyRoleMiddleware } from '@/middleware/role.middleware';
import { applySecurityMiddleware, validateCsrf } from '@/middleware/security.middleware';
import {
  ADMIN_AUTH_ROUTES,
  ADMIN_DEFAULT_LOGIN_REDIRECT,
  ADMIN_DEFAULT_LOGOUT_REDIRECT,
  ADMIN_ROUTE_PERMISSIONS,
} from '@/constants/routes';

function pathMatches(pathname: string, route: string): boolean {
  return pathname === route || pathname.startsWith(`${route}/`);
}

/** Admin app — only ever consults the admin_session cookie + admin route table. */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // API CSRF validation for mutating requests
  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/health')) {
    const isPublicAuth = pathname === '/api/auth/admin/login' || pathname === '/api/csrf';

    if (!isPublicAuth && !validateCsrf(request)) {
      return NextResponse.json(
        { success: false, message: 'Invalid CSRF token', code: 'CSRF_INVALID' },
        { status: 403 },
      );
    }
  }

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

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
