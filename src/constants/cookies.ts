export const COOKIE_NAMES = {
  CUSTOMER_SESSION: 'customer_session',
  ADMIN_SESSION: 'admin_session',
  CSRF_TOKEN: 'csrf_token',
} as const;

export const COOKIE_MAX_AGE = {
  SESSION: 60 * 60 * 24 * 7, // 7 days
  CSRF_TOKEN: 60 * 60 * 24, // 24 hours
} as const;
