import { apiClient } from '@/lib/axios';
import type { Quotation } from '@/types/admin';
import type { ApiSuccessResponse } from '@/types/api';

export const quotationsService = {
  async list() {
    const { data } =
      await apiClient.get<ApiSuccessResponse<{ quotations: Quotation[] }>>('/quotations');
    return data.data.quotations;
  },
};
