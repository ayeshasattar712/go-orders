import { apiClient } from '@/lib/axios';
import type { Invoice } from '@/types/enterprise';
import type { ApiSuccessResponse } from '@/types/api';

async function downloadPdfBlob(id: string) {
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
}

export const invoicesService = {
  async list() {
    const { data } = await apiClient.get<ApiSuccessResponse<{ invoices: Invoice[] }>>('/invoices');
    return data.data.invoices;
  },

  downloadPdf: downloadPdfBlob,
};
