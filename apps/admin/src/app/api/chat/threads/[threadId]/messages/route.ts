import { isResponse, requireStaffSession } from '@/lib/api-guard';
import { prisma } from '@/lib/prisma';
import { errorResponse, successResponse } from '@/lib/api-response';
import { serializeChatMessage, serializeChatThread } from '@/lib/chat/serialize';

export async function GET(request: Request, { params }: { params: Promise<{ threadId: string }> }) {
  const session = await requireStaffSession(request);
  if (isResponse(session)) return session;

  const { threadId } = await params;
  const thread = await prisma.chatThread.findUnique({
    where: { id: threadId },
    include: { messages: { orderBy: { createdAt: 'asc' } }, client: true },
  });

  if (!thread) {
    return errorResponse('Conversation not found', { status: 404, code: 'NOT_FOUND' });
  }

  await prisma.chatThread.update({
    where: { id: threadId },
    data: { unreadForAdmin: 0 },
  });

  return successResponse({
    thread: serializeChatThread(thread),
    messages: thread.messages.map(serializeChatMessage),
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ threadId: string }> },
) {
  const session = await requireStaffSession(request);
  if (isResponse(session)) return session;

  const { threadId } = await params;
  const thread = await prisma.chatThread.findUnique({ where: { id: threadId } });
  if (!thread) {
    return errorResponse('Conversation not found', { status: 404, code: 'NOT_FOUND' });
  }

  const payload = (await request.json()) as { body?: string };
  const text = payload.body?.trim();
  if (!text) {
    return errorResponse('Message is required', { status: 422, code: 'VALIDATION_ERROR' });
  }

  const user = await prisma.user.findUnique({ where: { id: session.sub } });
  const senderName = user ? `${user.firstName} ${user.lastName}`.trim() : 'GoOrder Admin';
  const now = new Date();

  const message = await prisma.chatMessage.create({
    data: {
      threadId,
      senderRole: 'ADMIN',
      senderId: session.sub,
      senderName: senderName || 'GoOrder Admin',
      body: text,
    },
  });

  const updated = await prisma.chatThread.update({
    where: { id: threadId },
    data: {
      lastMessagePreview: text,
      lastMessageAt: now,
      unreadForCustomer: { increment: 1 },
    },
    include: { client: true },
  });

  await prisma.appNotification.create({
    data: {
      clientId: thread.clientId,
      type: 'DELIVERY',
      title: 'New message from GoOrder',
      message: text.slice(0, 140),
      href: '/chat',
    },
  });

  return successResponse(
    { message: serializeChatMessage(message), thread: serializeChatThread(updated) },
    { status: 201 },
  );
}
