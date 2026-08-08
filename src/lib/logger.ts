type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  requestId?: string;
  userId?: string;
  path?: string;
  [key: string]: unknown;
}

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

function currentLevel(): LogLevel {
  return (process.env.LOG_LEVEL as LogLevel) || 'info';
}

function shouldLog(level: LogLevel): boolean {
  return LEVEL_PRIORITY[level] >= LEVEL_PRIORITY[currentLevel()];
}

/**
 * Structured logger that never dumps secrets/tokens.
 */
function sanitize(context?: LogContext): LogContext | undefined {
  if (!context) return undefined;
  const blocked = ['password', 'token', 'authorization', 'cookie', 'secret', 'refreshToken'];
  const safe: LogContext = {};

  for (const [key, value] of Object.entries(context)) {
    if (blocked.some((item) => key.toLowerCase().includes(item))) {
      safe[key] = '[REDACTED]';
      continue;
    }
    safe[key] = value;
  }

  return safe;
}

function write(level: LogLevel, message: string, context?: LogContext) {
  if (!shouldLog(level)) return;

  const entry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    env: process.env.NEXT_PUBLIC_APP_ENV ?? process.env.NODE_ENV,
    ...sanitize(context),
  };

  const line = JSON.stringify(entry);
  if (level === 'error') {
    console.error(line);
  } else if (level === 'warn') {
    console.warn(line);
  } else {
    console.log(line);
  }
}

export const logger = {
  debug: (message: string, context?: LogContext) => write('debug', message, context),
  info: (message: string, context?: LogContext) => write('info', message, context),
  warn: (message: string, context?: LogContext) => write('warn', message, context),
  error: (message: string, context?: LogContext) => write('error', message, context),
};
