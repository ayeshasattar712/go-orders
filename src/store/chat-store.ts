'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { chatMessages, chatThreads } from '@/lib/mock-data/admin';
import type { ChatAttachment, ChatMessage, ChatThread } from '@/types/admin';

interface ChatState {
  threads: ChatThread[];
  messages: ChatMessage[];
  sendMessage: (params: {
    threadId: string;
    senderRole: 'customer' | 'admin';
    senderName: string;
    body: string;
    attachments?: ChatAttachment[];
  }) => void;
  createThread: (params: {
    clientId: string;
    clientName: string;
    subject: string;
    firstMessage: string;
    senderRole: 'customer' | 'admin';
    senderName: string;
  }) => string;
  markThreadRead: (threadId: string, viewerRole: 'customer' | 'admin') => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      threads: chatThreads,
      messages: chatMessages,

      sendMessage: ({ threadId, senderRole, senderName, body, attachments }) => {
        const message: ChatMessage = {
          id: `msg_${Date.now()}`,
          threadId,
          senderRole,
          senderName,
          body,
          attachments,
          createdAt: new Date().toISOString(),
          readAt: null,
        };
        set({
          messages: [...get().messages, message],
          threads: get().threads.map((thread) =>
            thread.id === threadId
              ? {
                  ...thread,
                  lastMessagePreview: body || (attachments?.length ? 'Sent an attachment' : ''),
                  lastMessageAt: message.createdAt,
                  unreadForAdmin:
                    senderRole === 'customer' ? thread.unreadForAdmin + 1 : thread.unreadForAdmin,
                  unreadForCustomer:
                    senderRole === 'admin'
                      ? thread.unreadForCustomer + 1
                      : thread.unreadForCustomer,
                }
              : thread,
          ),
        });
      },

      createThread: ({ clientId, clientName, subject, firstMessage, senderRole, senderName }) => {
        const threadId = `thread_${Date.now()}`;
        const now = new Date().toISOString();
        const thread: ChatThread = {
          id: threadId,
          clientId,
          clientName,
          subject,
          lastMessagePreview: firstMessage,
          lastMessageAt: now,
          unreadForAdmin: senderRole === 'customer' ? 1 : 0,
          unreadForCustomer: senderRole === 'admin' ? 1 : 0,
        };
        const message: ChatMessage = {
          id: `msg_${Date.now()}`,
          threadId,
          senderRole,
          senderName,
          body: firstMessage,
          createdAt: now,
          readAt: null,
        };
        set({ threads: [thread, ...get().threads], messages: [...get().messages, message] });
        return threadId;
      },

      markThreadRead: (threadId, viewerRole) => {
        set({
          threads: get().threads.map((thread) =>
            thread.id === threadId
              ? {
                  ...thread,
                  unreadForAdmin: viewerRole === 'admin' ? 0 : thread.unreadForAdmin,
                  unreadForCustomer: viewerRole === 'customer' ? 0 : thread.unreadForCustomer,
                }
              : thread,
          ),
          messages: get().messages.map((message) =>
            message.threadId === threadId && message.readAt === null
              ? { ...message, readAt: new Date().toISOString() }
              : message,
          ),
        });
      },
    }),
    { name: 'goorder-chat' },
  ),
);

export function useThreadsForClient(clientId: string) {
  return useChatStore((state) => state.threads.filter((thread) => thread.clientId === clientId));
}

export function useMessagesForThread(threadId: string) {
  return useChatStore((state) =>
    state.messages
      .filter((message) => message.threadId === threadId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
  );
}
