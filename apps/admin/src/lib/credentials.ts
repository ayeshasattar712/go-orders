import { randomBytes } from 'node:crypto';

const PASSWORD_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';

export function generateTemporaryPassword(length = 12): string {
  const bytes = randomBytes(length);
  return Array.from(bytes, (byte) => PASSWORD_CHARS[byte % PASSWORD_CHARS.length]).join('');
}

export function slugEmailPart(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.+|\.+$/g, '')
    .slice(0, 24);
}

export function generateClientEmail(firstName: string, lastName: string): string {
  const base = slugEmailPart(`${firstName}.${lastName}`) || 'client';
  const suffix = randomBytes(2).toString('hex');
  return `${base}.${suffix}@client.goorder.com`;
}

export function shopLoginUrl(): string {
  const base = process.env.NEXT_PUBLIC_SHOP_URL ?? 'http://localhost:3000';
  return `${base.replace(/\/$/, '')}/login`;
}

export function adminLoginUrl(): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3001';
  return `${base.replace(/\/$/, '')}/admin/login`;
}
