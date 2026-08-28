import { encode, decode, getToken } from 'next-auth/jwt';
import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';
import { COOKIE_MAX_AGE } from '@/constants/cookies';
import { getServerEnv } from '@/lib/env';
import type { Permission, Role } from '@/constants/roles';
import type { PublicUser } from '@/lib/auth/shared';

/**
 * A session is backed by an Auth.js-issued JWT (via `next-auth/jwt`'s
 * encode/decode — the same primitive the full NextAuth() flow uses
 * internally), but minted/read by our own routes and middleware instead of
 * NextAuth's built-in catch-all handler. This keeps two fully independent
 * sessions (distinct cookie name + distinct signing secret per surface) while
 * reusing the existing sanitize/rate-limit/zod request pipeline unchanged —
 * adopting `next-auth/react`'s client SDK instead would mean two React
 * SessionProviders sharing one module-level `__NEXTAUTH` config singleton,
 * which is not safe for two simultaneously-live, independently-secured
 * sessions in one app.
 */
export interface AppSessionToken extends Record<string, unknown> {
  sub: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  permissions: Permission[];
  userType: 'CUSTOMER' | 'STAFF';
  iat?: number;
  exp?: number;
}

export interface SurfaceConfig {
  cookieName: string;
  secret: string;
}

export function adminSurfaceConfig(): SurfaceConfig {
  return { cookieName: 'admin_session', secret: getServerEnv().NEXTAUTH_SECRET_ADMIN };
}

export function customerSurfaceConfig(): SurfaceConfig {
  return { cookieName: 'customer_session', secret: getServerEnv().NEXTAUTH_SECRET_CUSTOMER };
}

export function sessionCookieOptions(maxAge = COOKIE_MAX_AGE.SESSION) {
  const env = getServerEnv();
  const isProd = env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax' as const,
    path: '/',
    maxAge,
    domain: env.COOKIE_DOMAIN === 'localhost' ? undefined : env.COOKIE_DOMAIN,
  };
}

export function tokenFromPublicUser(
  user: PublicUser,
  userType: 'CUSTOMER' | 'STAFF',
): AppSessionToken {
  return {
    sub: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    permissions: user.permissions,
    userType,
  };
}

export async function signSessionCookie(
  config: SurfaceConfig,
  payload: AppSessionToken,
): Promise<string> {
  return encode({
    secret: config.secret,
    salt: config.cookieName,
    maxAge: COOKIE_MAX_AGE.SESSION,
    token: payload,
  });
}

export async function setSessionCookie(config: SurfaceConfig, payload: AppSessionToken) {
  const value = await signSessionCookie(config, payload);
  const cookieStore = await cookies();
  cookieStore.set(config.cookieName, value, sessionCookieOptions());
}

export async function clearSessionCookie(config: SurfaceConfig) {
  const cookieStore = await cookies();
  cookieStore.set(config.cookieName, '', sessionCookieOptions(0));
}

/** For use in Server Components / Route Handlers via next/headers cookies(). */
export async function readSessionFromCookies(
  config: SurfaceConfig,
): Promise<AppSessionToken | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(config.cookieName)?.value;
  if (!raw) return null;
  try {
    const token = await decode<AppSessionToken>({
      secret: config.secret,
      salt: config.cookieName,
      token: raw,
    });
    return token;
  } catch {
    return null;
  }
}

/** For use in Middleware (Edge runtime) via the request itself. */
export async function readSessionFromRequest(
  config: SurfaceConfig,
  request: NextRequest,
): Promise<AppSessionToken | null> {
  try {
    const token = await getToken({
      req: request,
      secret: config.secret,
      salt: config.cookieName,
      cookieName: config.cookieName,
    });
    return token as AppSessionToken | null;
  } catch {
    return null;
  }
}
