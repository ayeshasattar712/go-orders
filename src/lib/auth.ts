import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import { cookies } from 'next/headers';
import { randomUUID } from 'crypto';
import { COOKIE_MAX_AGE, COOKIE_NAMES } from '@/constants/cookies';
import { ROLE_PERMISSIONS, type Permission, type Role } from '@/constants/roles';
import { getServerEnv } from '@/lib/env';
import type { JwtAccessPayload, JwtRefreshPayload, SessionUser, User } from '@/types/auth';

function getAccessSecret(): Uint8Array {
  return new TextEncoder().encode(getServerEnv().JWT_ACCESS_SECRET);
}

function getRefreshSecret(): Uint8Array {
  return new TextEncoder().encode(getServerEnv().JWT_REFRESH_SECRET);
}

function parseDurationToSeconds(duration: string): number {
  const match = /^(\d+)([smhd])$/.exec(duration);
  if (!match) return 900;
  const value = Number(match[1]);
  const unit = match[2];
  switch (unit) {
    case 's':
      return value;
    case 'm':
      return value * 60;
    case 'h':
      return value * 60 * 60;
    case 'd':
      return value * 60 * 60 * 24;
    default:
      return 900;
  }
}

export async function signAccessToken(user: Pick<User, 'id' | 'email' | 'role' | 'permissions'>) {
  const env = getServerEnv();
  const payload: JwtAccessPayload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    permissions: user.permissions,
    type: 'access',
  };

  return new SignJWT(payload as unknown as JWTPayload)
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt()
    .setExpirationTime(env.JWT_ACCESS_EXPIRES_IN)
    .setJti(randomUUID())
    .sign(getAccessSecret());
}

export async function signRefreshToken(userId: string) {
  const env = getServerEnv();
  const jti = randomUUID();
  const payload: JwtRefreshPayload = {
    sub: userId,
    type: 'refresh',
    jti,
  };

  const token = await new SignJWT(payload as unknown as JWTPayload)
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt()
    .setExpirationTime(env.JWT_REFRESH_EXPIRES_IN)
    .setJti(jti)
    .sign(getRefreshSecret());

  return { token, jti };
}

export async function verifyAccessToken(token: string): Promise<JwtAccessPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getAccessSecret());
    if (payload.type !== 'access' || typeof payload.sub !== 'string') return null;
    return payload as unknown as JwtAccessPayload;
  } catch {
    return null;
  }
}

export async function verifyRefreshToken(token: string): Promise<JwtRefreshPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getRefreshSecret());
    if (payload.type !== 'refresh' || typeof payload.sub !== 'string') return null;
    return payload as unknown as JwtRefreshPayload;
  } catch {
    return null;
  }
}

export function getSecureCookieOptions(maxAge: number) {
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

export async function setAuthCookies(accessToken: string, refreshToken: string) {
  const cookieStore = await cookies();
  const env = getServerEnv();

  cookieStore.set(
    COOKIE_NAMES.ACCESS_TOKEN,
    accessToken,
    getSecureCookieOptions(parseDurationToSeconds(env.JWT_ACCESS_EXPIRES_IN)),
  );
  cookieStore.set(
    COOKIE_NAMES.REFRESH_TOKEN,
    refreshToken,
    getSecureCookieOptions(parseDurationToSeconds(env.JWT_REFRESH_EXPIRES_IN)),
  );
}

export async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAMES.ACCESS_TOKEN, '', getSecureCookieOptions(0));
  cookieStore.set(COOKIE_NAMES.REFRESH_TOKEN, '', getSecureCookieOptions(0));
  cookieStore.set(COOKIE_NAMES.CSRF_TOKEN, '', {
    ...getSecureCookieOptions(0),
    httpOnly: false,
  });
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(COOKIE_NAMES.ACCESS_TOKEN)?.value;
  if (!accessToken) return null;

  const payload = await verifyAccessToken(accessToken);
  if (!payload) return null;

  return {
    id: payload.sub,
    email: payload.email,
    role: payload.role,
    permissions: payload.permissions,
    firstName: '',
    lastName: '',
  };
}

export function buildUserPermissions(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

export { COOKIE_MAX_AGE };
