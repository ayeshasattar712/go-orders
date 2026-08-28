import { NotificationType } from '@prisma/client';
import { isResponse, requireCustomerSession } from '@/lib/api-guard';
import { prisma } from '@/lib/prisma';
import { successResponse } from '@/lib/api-response';
import type { AppNotification, NotificationType as UiNotificationType } from '@/types/admin';

const TYPE: Record<NotificationType, UiNotificationType> = {
  INVOICE: 'invoice',
  PAYMENT: 'payment',
  DELIVERY: 'delivery',
  CREDIT: 'credit',
};

export async function GET(request: Request) {
  const session = await requireCustomerSession(request);
  if (isResponse(session)) return session;

  const client = await prisma.client.findUnique({ where: { userId: session.sub } });
  if (!client) return successResponse({ notifications: [] });

  const notifications = await prisma.appNotification.findMany({
    where: { clientId: client.id },
    orderBy: { createdAt: 'desc' },
  });

  return successResponse({
    notifications: notifications.map((item): AppNotification => ({
      id: item.id,
      type: TYPE[item.type],
      title: item.title,
      message: item.message,
      createdAt: item.createdAt.toISOString(),
      read: item.read,
      href: item.href ?? undefined,
    })),
  });
}

export async function PATCH(request: Request) {
  const session = await requireCustomerSession(request);
  if (isResponse(session)) return session;

  const body = (await request.json()) as { id?: string; all?: boolean };
  const client = await prisma.client.findUnique({ where: { userId: session.sub } });
  if (!client) return successResponse({ ok: true });

  if (body.all) {
    await prisma.appNotification.updateMany({
      where: { clientId: client.id },
      data: { read: true },
    });
  } else if (body.id) {
    await prisma.appNotification.updateMany({
      where: { id: body.id, clientId: client.id },
      data: { read: true },
    });
  }

  return successResponse({ ok: true });
}
