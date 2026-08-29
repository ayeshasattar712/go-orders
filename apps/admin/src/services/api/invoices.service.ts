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

  async downloadPdf(id: string) {
    const response = await apiClient.get<Blob>(`/invoices/${id}/pdf`, {
      responseType: 'blob',
      headers: { Accept: 'application/pdf' },
    });
    const blob = response.data;
    if (blob.type.includes('json')) {
      const payload = JSON.parse(await blob.text()) as { message?: string };
      throw new Error(payload.message ?? 'Unable to download invoice PDF');
    }
    const disposition = String(response.headers['content-disposition'] ?? '');
    const match = disposition.match(/filename="([^"]+)"/);
    return { blob, filename: match?.[1] ?? `${id}.pdf` };
  },
};
