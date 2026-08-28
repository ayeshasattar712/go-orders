import { apiClient } from '@/lib/axios';
import type { Invoice } from '@/types/enterprise';
import type { ApiSuccessResponse } from '@/types/api';

export const invoicesService = {
  async list() {
    const { data } = await apiClient.get<ApiSuccessResponse<{ invoices: Invoice[] }>>('/invoices');
    return data.data.invoices;
  },

  async create(payload: {
    clientId?: string;
    vendorOrCustomer?: string;
    amount: number;
    issueDate?: string;
    dueDate?: string;
    orderNumber?: string;
    type?: Invoice['type'];
  }) {
    const { data } = await apiClient.post<ApiSuccessResponse<{ invoice: Invoice }>>(
      '/invoices',
      payload,
    );
    return data.data.invoice;
  },

  async update(id: string, payload: { status?: Invoice['status']; amountPaid?: number }) {
    const { data } = await apiClient.patch<ApiSuccessResponse<{ invoice: Invoice }>>(
      `/invoices/${id}`,
      payload,
    );
    return data.data.invoice;
  },
};
