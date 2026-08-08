import { createHash, randomUUID, timingSafeEqual } from 'crypto';
import { buildUserPermissions } from '@/lib/auth';
import { ROLES, type Role } from '@/constants/roles';
import type { User } from '@/types/auth';

/**
 * In-memory user store for boilerplate demos.
 * Replace with a database + ORM (Prisma/Drizzle) in production.
 */

interface StoredUser extends User {
  passwordHash: string;
  refreshTokenJti?: string | null;
  resetTokenHash?: string | null;
  resetTokenExpiresAt?: number | null;
}

function hashPassword(password: string): string {
  return createHash('sha256').update(`enterprise-salt:${password}`).digest('hex');
}

function verifyPassword(password: string, hash: string): boolean {
  const computed = Buffer.from(hashPassword(password));
  const expected = Buffer.from(hash);
  if (computed.length !== expected.length) return false;
  return timingSafeEqual(computed, expected);
}

function toPublicUser(user: StoredUser): User {
  const { passwordHash: _passwordHash, refreshTokenJti: _jti, resetTokenHash: _reset, resetTokenExpiresAt: _exp, ...publicUser } =
    user;
  void _passwordHash;
  void _jti;
  void _reset;
  void _exp;
  return publicUser;
}

const now = new Date().toISOString();

const users = new Map<string, StoredUser>([
  [
    'admin@example.com',
    {
      id: 'usr_admin_001',
      email: 'admin@example.com',
      firstName: 'Alex',
      lastName: 'Admin',
      role: ROLES.ADMIN,
      permissions: buildUserPermissions(ROLES.ADMIN),
      avatarUrl: null,
      isActive: true,
      emailVerified: true,
      createdAt: now,
      updatedAt: now,
      passwordHash: hashPassword('Admin123!'),
      refreshTokenJti: null,
    },
  ],
  [
    'user@example.com',
    {
      id: 'usr_user_001',
      email: 'user@example.com',
      firstName: 'Sam',
      lastName: 'User',
      role: ROLES.USER,
      permissions: buildUserPermissions(ROLES.USER),
      avatarUrl: null,
      isActive: true,
      emailVerified: true,
      createdAt: now,
      updatedAt: now,
      passwordHash: hashPassword('User1234!'),
      refreshTokenJti: null,
    },
  ],
]);

export const userStore = {
  findByEmail(email: string): StoredUser | undefined {
    return users.get(email.toLowerCase());
  },

  findById(id: string): StoredUser | undefined {
    return Array.from(users.values()).find((user) => user.id === id);
  },

  list(): User[] {
    return Array.from(users.values()).map(toPublicUser);
  },

  authenticate(email: string, password: string): User | null {
    const user = this.findByEmail(email);
    if (!user || !user.isActive) return null;
    if (!verifyPassword(password, user.passwordHash)) return null;
    return toPublicUser(user);
  },

  create(input: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: Role;
  }): User {
    const email = input.email.toLowerCase();
    if (users.has(email)) {
      throw new Error('Email already registered');
    }

    const role = input.role ?? ROLES.USER;
    const timestamp = new Date().toISOString();
    const stored: StoredUser = {
      id: `usr_${randomUUID()}`,
      email,
      firstName: input.firstName,
      lastName: input.lastName,
      role,
      permissions: buildUserPermissions(role),
      avatarUrl: null,
      isActive: true,
      emailVerified: false,
      createdAt: timestamp,
      updatedAt: timestamp,
      passwordHash: hashPassword(input.password),
      refreshTokenJti: null,
    };

    users.set(email, stored);
    return toPublicUser(stored);
  },

  setRefreshJti(userId: string, jti: string | null) {
    const user = this.findById(userId);
    if (!user) return;
    user.refreshTokenJti = jti;
    user.updatedAt = new Date().toISOString();
  },

  validateRefreshJti(userId: string, jti: string): boolean {
    const user = this.findById(userId);
    if (!user || !user.refreshTokenJti) return false;
    return user.refreshTokenJti === jti;
  },

  setResetToken(email: string, token: string, expiresAt: number) {
    const user = this.findByEmail(email);
    if (!user) return;
    user.resetTokenHash = hashPassword(token);
    user.resetTokenExpiresAt = expiresAt;
  },

  resetPassword(token: string, password: string): boolean {
    const tokenHash = hashPassword(token);
    const user = Array.from(users.values()).find(
      (item) =>
        item.resetTokenHash === tokenHash &&
        item.resetTokenExpiresAt &&
        item.resetTokenExpiresAt > Date.now(),
    );
    if (!user) return false;

    user.passwordHash = hashPassword(password);
    user.resetTokenHash = null;
    user.resetTokenExpiresAt = null;
    user.refreshTokenJti = null;
    user.updatedAt = new Date().toISOString();
    return true;
  },

  toPublicUser,
};
