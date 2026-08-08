export const COOKIE_NAMES = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  CSRF_TOKEN: 'csrf_token',
  SESSION_ID: 'session_id',
} as const;

export const COOKIE_MAX_AGE = {
  ACCESS_TOKEN: 60 * 15, // 15 minutes
  REFRESH_TOKEN: 60 * 60 * 24 * 7, // 7 days
  CSRF_TOKEN: 60 * 60 * 24, // 24 hours
} as const;
