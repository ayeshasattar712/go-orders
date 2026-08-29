import { CreditTerms, Role, UserType } from '@prisma/client';
import { PERMISSIONS } from '@/constants/roles';
import { isResponse, requirePermission, requireStaffSession } from '@/lib/api-guard';
import { prisma } from '@/lib/prisma';
import { hashPassword, toPublicUser } from '@/lib/auth/shared';
import { errorResponse, successResponse } from '@/lib/api-response';
import { createClientLoginSchema, createStaffSchema } from '@/schemas/user.schema';
import {
  adminLoginUrl,
  generateClientEmail,
  generateTemporaryPassword,
  shopLoginUrl,
} from '@/lib/credentials';
import { CREDIT_TERMS_FROM_STRING } from '@/lib/enterprise-mapper';

async function uniqueEmail(
  preferred: string | undefined,
  firstName: string,
  lastName: string,
): Promise<string | Response> {
  if (preferred) {
    const email = preferred.toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email } });
    const clientTaken = await prisma.client.findUnique({ where: { email } });
    if (existing || clientTaken) {
      return errorResponse('Email already registered', { status: 409, code: 'EMAIL_TAKEN' });
    }
    return email;
  }

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const email = generateClientEmail(firstName, lastName);
    const existing = await prisma.user.findUnique({ where: { email } });
    const clientTaken = await prisma.client.findUnique({ where: { email } });
    if (!existing && !clientTaken) return email;
  }
  return errorResponse('Unable to allocate a unique email', { status: 409, code: 'EMAIL_TAKEN' });
}

export async function GET(request: Request) {
  const session = await requireStaffSession(request);
  if (isResponse(session)) return session;

  const allowed = requirePermission(session, PERMISSIONS.USERS_READ);
  if (allowed !== true) return allowed;

  const type = new URL(request.url).searchParams.get('type');
  const users = await prisma.user.findMany({
    where:
      type === 'staff'
        ? { userType: UserType.STAFF }
        : type === 'customer'
          ? { userType: UserType.CUSTOMER }
          : undefined,
    orderBy: { createdAt: 'desc' },
  });
  return successResponse({ users: users.map(toPublicUser) });
}

export async function POST(request: Request) {
  const session = await requireStaffSession(request);
  if (isResponse(session)) return session;

  const allowed = requirePermission(session, PERMISSIONS.USERS_WRITE);
  if (allowed !== true) return allowed;

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return errorResponse('Invalid payload', { status: 400, code: 'VALIDATION_ERROR' });
  }

  if (body.kind === 'client') {
    const parsed = createClientLoginSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse('Invalid client login payload', {
        status: 400,
        code: 'VALIDATION_ERROR',
      });
    }

    const password = generateTemporaryPassword();
    const emailOrError = await uniqueEmail(
      parsed.data.email,
      parsed.data.firstName,
      parsed.data.lastName,
    );
    if (emailOrError instanceof Response) return emailOrError;
    const email = emailOrError;

    const user = await prisma.user.create({
      data: {
        email,
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        passwordHash: await hashPassword(password),
        userType: UserType.CUSTOMER,
        role: Role.USER,
        isActive: true,
        emailVerified: new Date(),
        client: {
          create: {
            companyName: parsed.data.companyName,
            contactName: `${parsed.data.firstName} ${parsed.data.lastName}`.trim(),
            email,
            phone: parsed.data.phone || '—',
            address: '—',
            creditLimit: parsed.data.creditLimit ?? 5000,
            creditTerms: parsed.data.creditTerms
              ? CREDIT_TERMS_FROM_STRING[parsed.data.creditTerms]
              : CreditTerms.NET_30,
            joinedAt: new Date(),
          },
        },
      },
    });

    return successResponse(
      {
        user: toPublicUser(user),
        credentials: {
          email,
          password,
          loginUrl: shopLoginUrl(),
        },
      },
      { status: 201 },
    );
  }

  const parsed = createStaffSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse('Invalid staff payload', { status: 400, code: 'VALIDATION_ERROR' });
  }

  const password = parsed.data.password?.trim() || generateTemporaryPassword();
  const emailOrError = await uniqueEmail(
    parsed.data.email,
    parsed.data.firstName,
    parsed.data.lastName,
  );
  if (emailOrError instanceof Response) return emailOrError;
  const email = emailOrError;

  const user = await prisma.user.create({
    data: {
      email,
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      passwordHash: await hashPassword(password),
      userType: UserType.STAFF,
      role: parsed.data.role as Role,
      isActive: true,
      emailVerified: new Date(),
    },
  });

  return successResponse(
    {
      user: toPublicUser(user),
      credentials: {
        email,
        password,
        loginUrl: adminLoginUrl(),
      },
    },
    { status: 201 },
  );
}
