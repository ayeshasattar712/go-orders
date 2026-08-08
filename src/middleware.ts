import { NextResponse, type NextRequest } from 'next/server';
import { applyAuthMiddleware } from '@/middleware/auth.middleware';
import { applyRoleMiddleware } from '@/middleware/role.middleware';
import { applySecurityMiddleware, validateCsrf } from '@/middleware/security.middleware';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // API CSRF validation for mutating requests
  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/health')) {
    const isPublicAuth =
      pathname === '/api/auth/login' ||
      pathname === '/api/auth/register' ||
      pathname === '/api/auth/forgot-password' ||
      pathname === '/api/auth/reset-password' ||
      pathname === '/api/auth/refresh' ||
      pathname === '/api/csrf';

    if (!isPublicAuth && !validateCsrf(request)) {
      return NextResponse.json(
        { success: false, message: 'Invalid CSRF token', code: 'CSRF_INVALID' },
        { status: 403 },
      );
    }
  }

  const authResult = await applyAuthMiddleware(request);
  if (authResult.response) {
    return applySecurityMiddleware(request, authResult.response);
  }

  const roleBlock = applyRoleMiddleware(request, authResult.session);
  if (roleBlock) {
    return applySecurityMiddleware(request, roleBlock);
  }

  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  return applySecurityMiddleware(request, response);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
