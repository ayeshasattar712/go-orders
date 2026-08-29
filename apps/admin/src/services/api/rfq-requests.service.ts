import { apiClient } from '@/lib/axios';
import type { RfqRequest } from '@/types/enterprise';
import type { ApiSuccessResponse } from '@/types/api';

export const rfqRequestsService = {
  async list() {
    const { data } =
      await apiClient.get<ApiSuccessResponse<{ rfqs: RfqRequest[] }>>('/rfq-requests');
    return data.data.rfqs;
  },

  async create(payload: {
    title: string;
    requestedBy: string;
    department: string;
    category: string;
    quantity: number;
    estimatedValue: number;
  }) {
    const { data } = await apiClient.post<ApiSuccessResponse<{ rfq: RfqRequest }>>(
      '/rfq-requests',
      payload,
    );
    return data.data.rfq;
  },
};
