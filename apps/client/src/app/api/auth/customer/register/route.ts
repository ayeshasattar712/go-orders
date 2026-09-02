import { Prisma } from '@prisma/client';
import { registerSchema } from '@/schemas/auth.schema';
import { hashPassword, toPublicUser } from '@/lib/auth/shared';
import { setCustomerSessionCookie } from '@/lib/auth/customer-auth';
import { prisma } from '@/lib/prisma';
import { ROLES } from '@/constants/roles';
import { errorResponse, internalErrorResponse, successResponse } from '@/lib/api-response';
import { getClientIp, rateLimit } from '@/lib/rate-limit';
import { sanitizeObjectStrings } from '@/lib/api-guard';
import { logger } from '@/lib/logger';
import { getServerEnv } from '@/lib/env';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    getServerEnv();
    const ip = getClientIp(request);
    const limited = rateLimit(`register:customer:${ip}`, 10, 60_000);
    if (!limited.success) {
      return errorResponse('Too many registration attempts.', {
        status: 429,
        code: 'RATE_LIMITED',
      });
    }

    const body = sanitizeObjectStrings(await request.json());
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse('Validation failed', {
        status: 422,
        code: 'VALIDATION_ERROR',
        errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      });
    }

    const email = parsed.data.email.toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return errorResponse('Email already registered', { status: 409, code: 'EMAIL_EXISTS' });
    }

    let user;
    try {
      user = await prisma.user.create({
        data: {
          email,
          passwordHash: await hashPassword(parsed.data.password),
          firstName: parsed.data.firstName,
          lastName: parsed.data.lastName,
          userType: 'CUSTOMER',
          role: ROLES.USER,
          isActive: true,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        return errorResponse('Email already registered', { status: 409, code: 'EMAIL_EXISTS' });
      }
      throw error;
    }

    const publicUser = toPublicUser(user);
    await setCustomerSessionCookie(publicUser);

    const displayName = `${user.firstName} ${user.lastName}`.trim();
    await prisma.client.upsert({
      where: { email },
      update: { userId: user.id },
      create: {
        userId: user.id,
        companyName: `${displayName}'s account`,
        contactName: displayName,
        email,
        phone: '—',
        address: '—',
        joinedAt: new Date(),
      },
    });

    logger.info('Customer registered', { userId: user.id, ip });

    return successResponse(
      { user: publicUser, message: 'Account created successfully' },
      { status: 201, message: 'Account created successfully' },
    );
  } catch (error) {
    logger.error('Customer registration failed', {
      error: error instanceof Error ? error.message : 'unknown',
    });
    return internalErrorResponse(error);
  }
}
