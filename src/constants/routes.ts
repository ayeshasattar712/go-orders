export const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
] as const;

export const AUTH_ROUTES = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
] as const;

export const PROTECTED_ROUTES = [
  '/dashboard',
  '/users',
  '/settings',
  '/profile',
] as const;

export const API_AUTH_ROUTES = {
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  LOGOUT: '/api/auth/logout',
  REFRESH: '/api/auth/refresh',
  ME: '/api/auth/me',
  FORGOT_PASSWORD: '/api/auth/forgot-password',
  RESET_PASSWORD: '/api/auth/reset-password',
} as const;

export const DEFAULT_LOGIN_REDIRECT = '/dashboard';
export const DEFAULT_LOGOUT_REDIRECT = '/login';

export const ROUTE_PERMISSIONS: Record<string, string[]> = {
  '/users': ['users:read'],
  '/settings': ['settings:read'],
  '/dashboard': ['dashboard:read'],
  '/profile': ['profile:read'],
};
