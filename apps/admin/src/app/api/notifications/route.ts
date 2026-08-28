import { PERMISSIONS } from '@/constants/roles';
import { isResponse, requirePermission, requireStaffSession } from '@/lib/api-guard';
import { prisma } from '@/lib/prisma';
import { serializeNotification } from '@/lib/enterprise-mapper';
import { successResponse } from '@/lib/api-response';

export async function GET(request: Request) {
  const session = await requireStaffSession(request);
  if (isResponse(session)) return session;

  const allowed = requirePermission(session, PERMISSIONS.NOTIFICATIONS_READ);
  if (allowed !== true) return allowed;

  const notifications = await prisma.appNotification.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return successResponse({ notifications: notifications.map(serializeNotification) });
}
