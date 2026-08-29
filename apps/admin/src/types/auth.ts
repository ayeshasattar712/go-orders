import type { Permission, Role } from '@/constants/roles';

export type UserType = 'STAFF' | 'CUSTOMER';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  userType?: UserType;
  role: Role;
  permissions: Permission[];
  avatarUrl?: string | null;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface JwtAccessPayload {
  sub: string;
  email: string;
  role: Role;
  permissions: Permission[];
  type: 'access';
}

export interface JwtRefreshPayload {
  sub: string;
  type: 'refresh';
  jti: string;
}

export interface SessionUser {
  id: string;
  email: string;
  role: Role;
  permissions: Permission[];
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  user: User;
  message: string;
}

export interface ApiErrorBody {
  message: string;
  code?: string;
  errors?: Record<string, string[]>;
}
