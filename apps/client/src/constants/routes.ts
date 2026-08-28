export const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
] as const;

/** Routes that redirect an already-authenticated customer away. */
export const CUSTOMER_AUTH_ROUTES = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
] as const;

/**
 * Routes gated by the customer session (customer_session cookie).
 * Includes shop + purchase flows — guests are sent to /login.
 */
export const CUSTOMER_ROUTES = [
  '/home',
  '/products',
  '/categories',
  '/vendors',
  '/deals',
  '/cart',
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
export const CUSTOMER_DEFAULT_LOGOUT_REDIRECT = '/login';

export const CUSTOMER_ROUTE_PERMISSIONS: Record<string, string[]> = {
  '/home': ['dashboard:read'],
  '/products': ['dashboard:read'],
  '/categories': ['dashboard:read'],
  '/vendors': ['dashboard:read'],
  '/deals': ['dashboard:read'],
  '/cart': ['dashboard:read'],
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
