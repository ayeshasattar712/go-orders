import { isResponse, requireCustomerSession } from '@/lib/api-guard';
import { prisma } from '@/lib/prisma';
import { errorResponse, successResponse } from '@/lib/api-response';
import { serializeChatMessage, serializeChatThread } from '@/lib/chat/serialize';

export async function GET(request: Request, { params }: { params: Promise<{ threadId: string }> }) {
  const session = await requireCustomerSession(request);
  if (isResponse(session)) return session;

  const { threadId } = await params;
  const client = await prisma.client.findUnique({ where: { userId: session.sub } });
  const thread = await prisma.chatThread.findUnique({
    where: { id: threadId },
    include: { messages: { orderBy: { createdAt: 'asc' } }, client: true },
  });

  if (!thread || !client || thread.clientId !== client.id) {
    return errorResponse('Conversation not found', { status: 404, code: 'NOT_FOUND' });
  }

  await prisma.chatThread.update({
    where: { id: threadId },
    data: { unreadForCustomer: 0 },
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
  const session = await requireCustomerSession(request);
  if (isResponse(session)) return session;

  const { threadId } = await params;
  const user = await prisma.user.findUnique({ where: { id: session.sub } });
  const client = await prisma.client.findUnique({ where: { userId: session.sub } });
  const thread = await prisma.chatThread.findUnique({ where: { id: threadId } });

  if (!user || !client || !thread || thread.clientId !== client.id) {
    return errorResponse('Conversation not found', { status: 404, code: 'NOT_FOUND' });
  }

  const payload = (await request.json()) as { body?: string };
  const text = payload.body?.trim();
  if (!text) {
    return errorResponse('Message is required', { status: 422, code: 'VALIDATION_ERROR' });
  }

  const senderName = `${user.firstName} ${user.lastName}`.trim() || user.email;
  const now = new Date();
  const message = await prisma.chatMessage.create({
    data: {
      threadId,
      senderRole: 'CUSTOMER',
      senderId: user.id,
      senderName,
      body: text,
    },
  });

  const updated = await prisma.chatThread.update({
    where: { id: threadId },
    data: {
      lastMessagePreview: text,
      lastMessageAt: now,
      unreadForAdmin: { increment: 1 },
    },
    include: { client: true },
  });

  return successResponse(
    { message: serializeChatMessage(message), thread: serializeChatThread(updated) },
    { status: 201 },
  );
}
