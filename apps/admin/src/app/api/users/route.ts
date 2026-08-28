import { PERMISSIONS, type Role } from '@/constants/roles';
import { isResponse, requirePermission, requireStaffSession } from '@/lib/api-guard';
import { prisma } from '@/lib/prisma';
import { hashPassword, toPublicUser } from '@/lib/auth/shared';
import { errorResponse, successResponse } from '@/lib/api-response';
import { createStaffSchema } from '@/schemas/user.schema';

export async function GET(request: Request) {
  const session = await requireStaffSession(request);
  if (isResponse(session)) return session;

  const allowed = requirePermission(session, PERMISSIONS.USERS_READ);
  if (allowed !== true) return allowed;

  const users = await prisma.user.findMany({
    where: { userType: 'STAFF' },
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
  const parsed = createStaffSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse('Invalid staff payload', { status: 400, code: 'VALIDATION_ERROR' });
  }

  const email = parsed.data.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return errorResponse('Email already registered', { status: 409, code: 'EMAIL_TAKEN' });
  }

  const user = await prisma.user.create({
    data: {
      email,
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      passwordHash: await hashPassword(parsed.data.password),
      userType: 'STAFF',
      role: parsed.data.role as Role,
      isActive: true,
      emailVerified: new Date(),
    },
  });

  return successResponse({ user: toPublicUser(user) }, { status: 201 });
}
