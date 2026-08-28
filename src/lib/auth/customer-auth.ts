import type { NextRequest } from 'next/server';
import {
  clearSessionCookie,
  customerSurfaceConfig,
  readSessionFromCookies,
  readSessionFromRequest,
  setSessionCookie,
  tokenFromPublicUser,
  type AppSessionToken,
} from '@/lib/auth/session';
import type { PublicUser } from '@/lib/auth/shared';

export async function setCustomerSessionCookie(user: PublicUser) {
  const token = tokenFromPublicUser(user, 'CUSTOMER');
  await setSessionCookie(customerSurfaceConfig(), token);
}

export async function clearCustomerSessionCookie() {
  await clearSessionCookie(customerSurfaceConfig());
}

/** Server Components / Route Handlers. */
export async function getCustomerSession(): Promise<AppSessionToken | null> {
  const token = await readSessionFromCookies(customerSurfaceConfig());
  return token?.userType === 'CUSTOMER' ? token : null;
}

/** Middleware (Edge runtime). */
export async function getCustomerSessionFromRequest(
  request: NextRequest,
): Promise<AppSessionToken | null> {
  const token = await readSessionFromRequest(customerSurfaceConfig(), request);
  return token?.userType === 'CUSTOMER' ? token : null;
}
