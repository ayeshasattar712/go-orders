import { isResponse, requireCustomerSession } from '@/lib/api-guard';
import { prisma } from '@/lib/prisma';
import { errorResponse, successResponse } from '@/lib/api-response';
import { serializeChatMessage, serializeChatThread } from '@/lib/chat/serialize';
import { ensureCustomerClient } from '@/lib/commerce/fulfill-order';

export async function GET(request: Request) {
  const session = await requireCustomerSession(request);
  if (isResponse(session)) return session;

  const client = await prisma.client.findUnique({ where: { userId: session.sub } });
  if (!client) return successResponse({ threads: [] });

  const threads = await prisma.chatThread.findMany({
    where: { clientId: client.id },
    include: { client: true },
    orderBy: { lastMessageAt: 'desc' },
  });

  return successResponse({ threads: threads.map(serializeChatThread) });
}

export async function POST(request: Request) {
  const session = await requireCustomerSession(request);
  if (isResponse(session)) return session;

  const user = await prisma.user.findUnique({ where: { id: session.sub } });
  if (!user) return errorResponse('Account not found', { status: 401, code: 'UNAUTHORIZED' });

  const body = (await request.json()) as { subject?: string; message?: string };
  const subject = body.subject?.trim() || 'Chat with GoOrder';
  const firstMessage = body.message?.trim() || 'Hi GoOrder, I need help with my order.';
  const senderName = `${user.firstName} ${user.lastName}`.trim() || user.email;

  const client = await ensureCustomerClient({
    userId: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
  });

  const now = new Date();
  const thread = await prisma.chatThread.create({
    data: {
      clientId: client.id,
      subject,
      lastMessagePreview: firstMessage,
      lastMessageAt: now,
      unreadForAdmin: 1,
      unreadForCustomer: 0,
      messages: {
        create: {
          senderRole: 'CUSTOMER',
          senderId: user.id,
          senderName,
          body: firstMessage,
        },
      },
    },
    include: { client: true, messages: true },
  });

  return successResponse(
    {
      thread: serializeChatThread(thread),
      messages: thread.messages.map(serializeChatMessage),
    },
    { status: 201 },
  );
}
