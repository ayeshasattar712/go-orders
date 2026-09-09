export const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/home',
  '/products',
  '/categories',
  '/vendors',
  '/deals',
  '/cart',
] as const;

/** Routes that redirect an already-authenticated customer away. */
export const CUSTOMER_AUTH_ROUTES = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
] as const;

/**
 * Routes gated by the customer session (customer_session cookie).
 * Catalog browsing is public; purchase/account flows send guests to /login.
 */
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

export const API_AUTH_ROUTES = {
  CUSTOMER_LOGIN: '/api/auth/customer/login',
  CUSTOMER_REGISTER: '/api/auth/customer/register',
  CUSTOMER_LOGOUT: '/api/auth/customer/logout',
  CUSTOMER_ME: '/api/auth/customer/me',
  FORGOT_PASSWORD: '/api/auth/forgot-password',
  RESET_PASSWORD: '/api/auth/reset-password',
} as const;

/** After login/signup, land on the marketplace. */
export const CUSTOMER_DEFAULT_LOGIN_REDIRECT = '/home';
export const CUSTOMER_DEFAULT_LOGOUT_REDIRECT = '/home';

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
