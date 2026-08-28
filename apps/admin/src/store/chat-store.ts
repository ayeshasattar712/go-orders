'use client';

import { create } from 'zustand';
import type { ChatMessage, ChatThread } from '@/types/admin';

interface ChatState {
  threads: ChatThread[];
  messages: ChatMessage[];
  isConnected: boolean;
  setThreads: (threads: ChatThread[]) => void;
  setMessages: (messages: ChatMessage[]) => void;
  addThread: (thread: ChatThread) => void;
  updateThread: (thread: ChatThread) => void;
  addMessage: (message: ChatMessage) => void;
  setConnected: (connected: boolean) => void;
  sendMessage: (params: {
    threadId: string;
    senderRole: 'customer' | 'admin';
    senderName: string;
    body: string;
    attachments?: ChatMessage['attachments'];
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

let nextId = 1;
function generateId(prefix: string) {
  return `${prefix}_${Date.now()}_${nextId++}`;
}

export const useChatStore = create<ChatState>()((set) => ({
  threads: [],
  messages: [],
  isConnected: false,

  setThreads: (threads) => set({ threads }),
  setMessages: (messages) => set({ messages }),
  addThread: (thread) => set((state) => ({ threads: [thread, ...state.threads] })),
  updateThread: (thread) =>
    set((state) => ({
      threads: state.threads.map((t) => (t.id === thread.id ? thread : t)),
    })),
  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),
  setConnected: (connected) => set({ isConnected: connected }),

  sendMessage: ({ threadId, senderRole, senderName, body, attachments }) => {
    const message: ChatMessage = {
      id: generateId('msg'),
      threadId,
      senderRole,
      senderName,
      body,
      createdAt: new Date().toISOString(),
      readAt: null,
      attachments,
    };

    set((state) => ({
      messages: [...state.messages, message],
      threads: state.threads.map((thread) =>
        thread.id === threadId
          ? {
              ...thread,
              lastMessagePreview: body || 'Sent an attachment',
              lastMessageAt: message.createdAt,
              unreadForAdmin:
                senderRole === 'customer'
                  ? (thread.unreadForAdmin || 0) + 1
                  : thread.unreadForAdmin,
              unreadForCustomer:
                senderRole === 'admin'
                  ? (thread.unreadForCustomer || 0) + 1
                  : thread.unreadForCustomer,
            }
          : thread,
      ),
    }));
  },

  createThread: ({ clientId, clientName, subject, firstMessage, senderRole, senderName }) => {
    const threadId = generateId('thread');
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
      id: generateId('msg'),
      threadId,
      senderRole,
      senderName,
      body: firstMessage,
      createdAt: now,
      readAt: null,
    };

    set((state) => ({
      threads: [thread, ...state.threads],
      messages: [...state.messages, message],
    }));

    return threadId;
  },

  markThreadRead: (threadId, viewerRole) => {
    set((state) => ({
      threads: state.threads.map((thread) =>
        thread.id === threadId
          ? {
              ...thread,
              unreadForAdmin: viewerRole === 'admin' ? 0 : thread.unreadForAdmin,
              unreadForCustomer: viewerRole === 'customer' ? 0 : thread.unreadForCustomer,
            }
          : thread,
      ),
      messages: state.messages.map((message) =>
        threadId === message.threadId &&
        message.readAt === null &&
        message.senderRole !== viewerRole
          ? { ...message, readAt: new Date().toISOString() }
          : message,
      ),
    }));
  },
}));

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
