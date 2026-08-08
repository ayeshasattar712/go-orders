import { NextResponse, type NextRequest } from 'next/server';
import { ROUTE_PERMISSIONS } from '@/constants/routes';
import type { JwtAccessPayload } from '@/types/auth';

function pathMatches(pathname: string, route: string): boolean {
  return pathname === route || pathname.startsWith(`${route}/`);
}

/**
 * Enforces RBAC permission checks for matched routes.
 */
export function applyRoleMiddleware(
  request: NextRequest,
  session: JwtAccessPayload | null,
): NextResponse | null {
  const { pathname } = request.nextUrl;

  for (const [route, permissions] of Object.entries(ROUTE_PERMISSIONS)) {
    if (!pathMatches(pathname, route)) continue;
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    if (session.role === 'SUPER_ADMIN') return null;

    const allowed = permissions.some((permission) =>
      session.permissions.includes(permission as (typeof session.permissions)[number]),
    );

    if (!allowed) {
      const forbiddenUrl = new URL('/dashboard', request.url);
      forbiddenUrl.searchParams.set('error', 'forbidden');
      return NextResponse.redirect(forbiddenUrl);
    }
  }

  return null;
}
