export const PUBLIC_ROUTES = ['/admin/login'] as const;

/** Routes that redirect an already-authenticated staff member away. */
export const ADMIN_AUTH_ROUTES = ['/admin/login'] as const;

/**
 * Routes gated by the admin/staff session (admin_session cookie). '/admin'
 * covers every nested admin page (categories, products, users, settings, ...)
 * via prefix matching — see pathMatches() in the admin middleware.
 */
export const ADMIN_ROUTES = [
  '/admin',
  '/procurement',
  '/inventory',
  '/delivery',
  '/accounting',
  '/crm',
  '/ai-forecasting',
  '/assets',
  '/tenders',
  '/bi',
] as const;

export const API_AUTH_ROUTES = {
  ADMIN_LOGIN: '/api/auth/admin/login',
  ADMIN_LOGOUT: '/api/auth/admin/logout',
  ADMIN_ME: '/api/auth/admin/me',
} as const;

export const ADMIN_DEFAULT_LOGIN_REDIRECT = '/admin';
export const ADMIN_DEFAULT_LOGOUT_REDIRECT = '/admin/login';

export const ADMIN_ROUTE_PERMISSIONS: Record<string, string[]> = {
  '/admin': ['admin:access'],
  '/procurement': ['admin:access'],
  '/inventory': ['admin:access'],
  '/delivery': ['admin:access'],
  '/accounting': ['admin:access'],
  '/crm': ['admin:access'],
  '/ai-forecasting': ['admin:access'],
  '/assets': ['admin:access'],
  '/tenders': ['admin:access'],
  '/bi': ['admin:access'],
};

/**
 * Customer route constants are not used by the admin middleware.
 * Kept only so leftover unused modules still typecheck until fully removed.
 */
export const CUSTOMER_AUTH_ROUTES = [] as const;
export const CUSTOMER_ROUTES = [] as const;
export const CUSTOMER_DEFAULT_LOGIN_REDIRECT = '/admin/login';
export const CUSTOMER_DEFAULT_LOGOUT_REDIRECT = '/admin/login';
export const CUSTOMER_ROUTE_PERMISSIONS: Record<string, string[]> = {};
