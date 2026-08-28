export const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/admin/login',
] as const;

/** Customer-surface routes that redirect an already-authenticated customer away. */
export const CUSTOMER_AUTH_ROUTES = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
] as const;

/** Admin-surface routes that redirect an already-authenticated staff member away. */
export const ADMIN_AUTH_ROUTES = ['/admin/login'] as const;

/** Routes gated by the customer session (customer_session cookie). */
export const CUSTOMER_ROUTES = [
  '/dashboard',
  '/profile',
  '/checkout',
  '/orders',
  '/favorites',
  '/invoices',
  '/credit',
  '/quotations',
  '/notifications',
  '/chat',
] as const;

/**
 * Routes gated by the admin/staff session (admin_session cookie). '/admin'
 * covers every nested admin page (categories, products, users, settings, ...)
 * via prefix matching — see pathMatches() in the admin/customer middleware.
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
  CUSTOMER_LOGIN: '/api/auth/customer/login',
  CUSTOMER_REGISTER: '/api/auth/customer/register',
  CUSTOMER_LOGOUT: '/api/auth/customer/logout',
  CUSTOMER_ME: '/api/auth/customer/me',
  ADMIN_LOGIN: '/api/auth/admin/login',
  ADMIN_LOGOUT: '/api/auth/admin/logout',
  ADMIN_ME: '/api/auth/admin/me',
  FORGOT_PASSWORD: '/api/auth/forgot-password',
  RESET_PASSWORD: '/api/auth/reset-password',
} as const;

export const CUSTOMER_DEFAULT_LOGIN_REDIRECT = '/dashboard';
export const CUSTOMER_DEFAULT_LOGOUT_REDIRECT = '/login';
export const ADMIN_DEFAULT_LOGIN_REDIRECT = '/admin';
export const ADMIN_DEFAULT_LOGOUT_REDIRECT = '/admin/login';

export const CUSTOMER_ROUTE_PERMISSIONS: Record<string, string[]> = {
  '/dashboard': ['dashboard:read'],
  '/checkout': ['dashboard:read'],
  '/orders': ['dashboard:read'],
  '/favorites': ['profile:read'],
  '/invoices': ['dashboard:read'],
  '/credit': ['dashboard:read'],
  '/quotations': ['dashboard:read'],
  '/notifications': ['dashboard:read'],
  '/chat': ['dashboard:read'],
  '/profile': ['profile:read'],
};

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
