import bcrypt from 'bcrypt';
import { prisma } from '@/lib/prisma';
import { ROLE_PERMISSIONS, type Permission, type Role } from '@/constants/roles';
import type { User as PrismaUser, UserType } from '@prisma/client';

const BCRYPT_ROUNDS = 12;

export function buildPermissions(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/** Looks up a user scoped to one surface's userType — a CUSTOMER credential can never resolve a STAFF row and vice versa. */
export async function authenticate(
  email: string,
  password: string,
  userType: UserType,
): Promise<PrismaUser | null> {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user || user.userType !== userType || !user.isActive) return null;

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) return null;

  return user;
}

export interface PublicUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  permissions: Permission[];
  avatarUrl: string | null;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export function toPublicUser(user: PrismaUser): PublicUser {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role as Role,
    permissions: buildPermissions(user.role as Role),
    avatarUrl: user.avatarUrl,
    isActive: user.isActive,
    emailVerified: Boolean(user.emailVerified),
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}
