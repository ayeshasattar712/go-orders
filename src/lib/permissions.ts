import { ROLE_HIERARCHY, type Permission, type Role } from '@/constants/roles';
import type { SessionUser, User } from '@/types/auth';

type AuthSubject = Pick<User, 'role' | 'permissions'> | SessionUser | null | undefined;

export function hasPermission(user: AuthSubject, permission: Permission): boolean {
  if (!user) return false;
  if (user.role === 'SUPER_ADMIN') return true;
  return user.permissions.includes(permission);
}

export function hasAnyPermission(user: AuthSubject, permissions: Permission[]): boolean {
  if (!user) return false;
  if (permissions.length === 0) return true;
  return permissions.some((permission) => hasPermission(user, permission));
}

export function hasAllPermissions(user: AuthSubject, permissions: Permission[]): boolean {
  if (!user) return false;
  return permissions.every((permission) => hasPermission(user, permission));
}

export function hasRole(user: AuthSubject, role: Role): boolean {
  if (!user) return false;
  return user.role === role;
}

export function hasMinimumRole(user: AuthSubject, minimumRole: Role): boolean {
  if (!user) return false;
  return ROLE_HIERARCHY[user.role] >= ROLE_HIERARCHY[minimumRole];
}

export function canAccessRoute(user: AuthSubject, requiredPermissions: string[]): boolean {
  if (!requiredPermissions.length) return Boolean(user);
  return hasAnyPermission(user, requiredPermissions as Permission[]);
}

export function assertPermission(user: AuthSubject, permission: Permission): void {
  if (!hasPermission(user, permission)) {
    throw new Error('Forbidden: insufficient permissions');
  }
}
