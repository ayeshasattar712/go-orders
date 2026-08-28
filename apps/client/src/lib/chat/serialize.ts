import type { ChatMessage, ChatThread } from '@/types/admin';
import type {
  ChatMessage as PrismaMessage,
  ChatThread as PrismaThread,
  Client,
} from '@prisma/client';

export function serializeChatThread(
  thread: PrismaThread & { client?: Pick<Client, 'contactName' | 'companyName'> | null },
): ChatThread {
  return {
    id: thread.id,
    clientId: thread.clientId,
    clientName: thread.client?.contactName || thread.client?.companyName || 'Customer',
    subject: thread.subject,
    relatedOrderNumber: thread.relatedOrderNumber ?? undefined,
    relatedInvoiceNumber: thread.relatedInvoiceNumber ?? undefined,
    lastMessagePreview: thread.lastMessagePreview,
    lastMessageAt: thread.lastMessageAt.toISOString(),
    unreadForAdmin: thread.unreadForAdmin,
    unreadForCustomer: thread.unreadForCustomer,
  };
}

export function serializeChatMessage(message: PrismaMessage): ChatMessage {
  return {
    id: message.id,
    threadId: message.threadId,
    senderRole: message.senderRole === 'ADMIN' ? 'admin' : 'customer',
    senderName: message.senderName,
    body: message.body,
    createdAt: message.createdAt.toISOString(),
    readAt: message.readAt ? message.readAt.toISOString() : null,
  };
}
