import { NextResponse, type NextRequest } from 'next/server';
import type { AppSessionToken } from '@/lib/auth/session';

function pathMatches(pathname: string, route: string): boolean {
  return pathname === route || pathname.startsWith(`${route}/`);
}

/**
 * Enforces RBAC permission checks for matched routes, scoped to whichever
 * surface's route/permission table and session the caller passes in — the
 * two middleware branches in the root middleware never cross-wire a
 * customer session against admin route permissions or vice versa.
 */
export function applyRoleMiddleware(
  request: NextRequest,
  session: AppSessionToken | null,
  routePermissions: Record<string, string[]>,
  noSessionRedirect: string,
  forbiddenRedirect: string,
): NextResponse | null {
  const { pathname } = request.nextUrl;

  for (const [route, permissions] of Object.entries(routePermissions)) {
    if (!pathMatches(pathname, route)) continue;
    if (!session) {
      return NextResponse.redirect(new URL(noSessionRedirect, request.url));
    }

    if (session.role === 'SUPER_ADMIN') return null;

    const allowed = permissions.some((permission) =>
      session.permissions.includes(permission as (typeof session.permissions)[number]),
    );

    if (!allowed) {
      const forbiddenUrl = new URL(forbiddenRedirect, request.url);
      forbiddenUrl.searchParams.set('error', 'forbidden');
      return NextResponse.redirect(forbiddenUrl);
    }
  }

  return null;
}
