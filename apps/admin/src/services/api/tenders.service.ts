import { apiClient } from '@/lib/axios';
import type { Tender, Bid, RfqRequest } from '@/types/enterprise';
import type { ApiSuccessResponse } from '@/types/api';

export interface TendersResponse {
  tenders: Tender[];
  bidsByTender: Record<string, Bid[]>;
  quotesByRfq: Record<string, Bid[]>;
  rfqs: RfqRequest[];
}

export const tendersService = {
  async list() {
    const { data } = await apiClient.get<ApiSuccessResponse<TendersResponse>>('/tenders');
    return data.data;
  },

  async create(payload: Partial<Tender>) {
    const { data } = await apiClient.post<ApiSuccessResponse<{ tender: Tender }>>(
      '/tenders',
      payload,
    );
    return data.data.tender;
  },
};
