import { apiClient } from '@/lib/axios';
import type { Invoice } from '@/types/enterprise';
import type { ApiSuccessResponse } from '@/types/api';

export const invoicesService = {
  async list() {
    const { data } = await apiClient.get<ApiSuccessResponse<{ invoices: Invoice[] }>>('/invoices');
    return data.data.invoices;
  },

  async download(invoiceId: string) {
    const { data } = await apiClient.post<
      ApiSuccessResponse<{ filename: string; content: string }>
    >('/invoices', { invoiceId });
    return data.data;
  },
};
