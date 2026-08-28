import { apiClient } from '@/lib/axios';
import type { SupportTicket } from '@/types/enterprise';
import type { ApiSuccessResponse } from '@/types/api';

export const supportTicketsService = {
  async list() {
    const { data } =
      await apiClient.get<ApiSuccessResponse<{ tickets: SupportTicket[] }>>('/support-tickets');
    return data.data.tickets;
  },
};
