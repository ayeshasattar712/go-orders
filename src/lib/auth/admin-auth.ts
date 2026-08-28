import type { NextRequest } from 'next/server';
import {
  adminSurfaceConfig,
  clearSessionCookie,
  readSessionFromCookies,
  readSessionFromRequest,
  setSessionCookie,
  tokenFromPublicUser,
  type AppSessionToken,
} from '@/lib/auth/session';
import type { PublicUser } from '@/lib/auth/shared';

export async function setAdminSessionCookie(user: PublicUser) {
  const token = tokenFromPublicUser(user, 'STAFF');
  await setSessionCookie(adminSurfaceConfig(), token);
}

export async function clearAdminSessionCookie() {
  await clearSessionCookie(adminSurfaceConfig());
}

/** Server Components / Route Handlers. */
export async function getAdminSession(): Promise<AppSessionToken | null> {
  const token = await readSessionFromCookies(adminSurfaceConfig());
  return token?.userType === 'STAFF' ? token : null;
}

/** Middleware (Edge runtime). */
export async function getAdminSessionFromRequest(
  request: NextRequest,
): Promise<AppSessionToken | null> {
  const token = await readSessionFromRequest(adminSurfaceConfig(), request);
  return token?.userType === 'STAFF' ? token : null;
}
