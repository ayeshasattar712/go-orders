import { apiClient } from '@/lib/axios';
import type { ChatMessage, ChatThread } from '@/types/admin';
import type { ApiSuccessResponse } from '@/types/api';

export const chatService = {
  async listThreads() {
    const { data } =
      await apiClient.get<ApiSuccessResponse<{ threads: ChatThread[] }>>('/chat/threads');
    return data.data.threads;
  },

  async createThread(payload: { subject?: string; message?: string }) {
    const { data } = await apiClient.post<
      ApiSuccessResponse<{ thread: ChatThread; messages: ChatMessage[] }>
    >('/chat/threads', payload);
    return data.data;
  },

  async listMessages(threadId: string) {
    const { data } = await apiClient.get<
      ApiSuccessResponse<{ thread: ChatThread; messages: ChatMessage[] }>
    >(`/chat/threads/${threadId}/messages`);
    return data.data;
  },

  async sendMessage(threadId: string, body: string) {
    const { data } = await apiClient.post<
      ApiSuccessResponse<{ message: ChatMessage; thread: ChatThread }>
    >(`/chat/threads/${threadId}/messages`, { body });
    return data.data;
  },
};
