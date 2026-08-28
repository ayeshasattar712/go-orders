import { apiClient } from '@/lib/axios';
import type { Client } from '@/types/admin';
import type { ApiSuccessResponse } from '@/types/api';

export const clientsService = {
  async list() {
    const { data } = await apiClient.get<ApiSuccessResponse<{ clients: Client[] }>>('/clients');
    return data.data.clients;
  },

  async create(payload: {
    companyName: string;
    contactName: string;
    email: string;
    phone?: string;
    address?: string;
    creditLimit?: number;
  }) {
    const { data } = await apiClient.post<ApiSuccessResponse<{ client: Client }>>(
      '/clients',
      payload,
    );
    return data.data.client;
  },

  async update(
    id: string,
    payload: { status?: Client['status']; creditLimit?: number; creditFrozen?: boolean },
  ) {
    const { data } = await apiClient.patch<ApiSuccessResponse<{ client: Client }>>(
      `/clients/${id}`,
      payload,
    );
    return data.data.client;
  },
};
