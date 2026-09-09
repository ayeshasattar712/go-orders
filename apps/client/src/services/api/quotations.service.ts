import { apiClient } from '@/lib/axios';
import type { Quotation } from '@/types/admin';
import type { ApiSuccessResponse } from '@/types/api';

export const quotationsService = {
  async list() {
    const { data } =
      await apiClient.get<ApiSuccessResponse<{ quotations: Quotation[] }>>('/quotations');
    return data.data.quotations;
  },

  async create(payload: {
    productId?: string;
    productName: string;
    quantity: number;
    unit: string;
    notes?: string;
    estimatedTotal?: number;
    vendorId?: string;
  }) {
    const { data } = await apiClient.post<ApiSuccessResponse<{ quotation: Quotation }>>(
      '/quotations',
      payload,
    );
    return data.data.quotation;
  },
};
