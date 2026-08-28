import { NextResponse } from 'next/server';
import { PERMISSIONS } from '@/constants/roles';
import { isResponse, requirePermission, requireStaffSession } from '@/lib/api-guard';
import { prisma } from '@/lib/prisma';
import { toPublicUser } from '@/lib/auth/shared';
import { errorResponse, successResponse } from '@/lib/api-response';
import { updateUserSchema } from '@/schemas/user.schema';

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const session = await requireStaffSession(request);
  if (isResponse(session)) return session;

  const allowed = requirePermission(session, PERMISSIONS.USERS_WRITE);
  if (allowed !== true) return allowed;

  const { id } = await context.params;
  if (id === session.sub) {
    return errorResponse('You cannot change your own account status here', {
      status: 400,
      code: 'SELF_EDIT',
    });
  }

  const body = await request.json().catch(() => null);
  const parsed = updateUserSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse('Invalid update payload', { status: 400, code: 'VALIDATION_ERROR' });
  }

  const existing = await prisma.user.findFirst({ where: { id, userType: 'STAFF' } });
  if (!existing) {
    return errorResponse('User not found', { status: 404, code: 'NOT_FOUND' });
  }

  const user = await prisma.user.update({
    where: { id },
    data: {
      ...(parsed.data.firstName !== undefined ? { firstName: parsed.data.firstName } : {}),
      ...(parsed.data.lastName !== undefined ? { lastName: parsed.data.lastName } : {}),
      ...(parsed.data.role !== undefined ? { role: parsed.data.role } : {}),
      ...(parsed.data.isActive !== undefined ? { isActive: parsed.data.isActive } : {}),
    },
  });

  return successResponse({ user: toPublicUser(user) });
}

export async function DELETE(request: Request, context: RouteContext) {
  const session = await requireStaffSession(request);
  if (isResponse(session)) return session;

  const allowed = requirePermission(session, PERMISSIONS.USERS_DELETE);
  if (allowed !== true) return allowed;

  const { id } = await context.params;
  if (id === session.sub) {
    return errorResponse('You cannot delete your own account', {
      status: 400,
      code: 'SELF_DELETE',
    });
  }

  const existing = await prisma.user.findFirst({ where: { id, userType: 'STAFF' } });
  if (!existing) {
    return errorResponse('User not found', { status: 404, code: 'NOT_FOUND' });
  }

  await prisma.user.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
