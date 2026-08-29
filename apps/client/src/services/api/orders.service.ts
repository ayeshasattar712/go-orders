import { apiClient } from '@/lib/axios';
import type { Order } from '@/types/catalog';
import type { ApiSuccessResponse } from '@/types/api';

export interface CreateOrderItemPayload {
  productId?: string;
  name: string;
  image: string;
  quantity: number;
  price: number;
}

export interface CreateOrderPayload {
  items: CreateOrderItemPayload[];
  vendorName: string;
  shipping: number;
  tax: number;
  paymentMethod: 'bank-account' | 'online-transfer';
  transferReference?: string;
  deliveryOption: 'hour' | 'standard' | 'express' | 'scheduled';
  address: {
    fullName: string;
    line1: string;
    city: string;
    state: string;
    zip: string;
  };
}

export const ordersService = {
  async list() {
    const { data } = await apiClient.get<ApiSuccessResponse<{ orders: Order[] }>>('/orders');
    return data.data.orders;
  },

  async create(payload: CreateOrderPayload) {
    const { data } = await apiClient.post<ApiSuccessResponse<{ order: Order }>>('/orders', payload);
    return data.data.order;
  },

  async downloadPdf(orderNumber: string) {
    const response = await apiClient.get<Blob>(
      `/orders/${encodeURIComponent(orderNumber)}/pdf`,
      {
        responseType: 'blob',
        headers: { Accept: 'application/pdf' },
      },
    );
    const blob = response.data;
    if (blob.type.includes('json')) {
      const payload = JSON.parse(await blob.text()) as { message?: string };
      throw new Error(payload.message ?? 'Unable to download order PDF');
    }
    const disposition = String(response.headers['content-disposition'] ?? '');
    const match = disposition.match(/filename="([^"]+)"/);
    return { blob, filename: match?.[1] ?? `${orderNumber}.pdf` };
  },

  async downloadChallanPdf(orderNumber: string) {
    const response = await apiClient.get<Blob>(
      `/orders/${encodeURIComponent(orderNumber)}/challan/pdf`,
      {
        responseType: 'blob',
        headers: { Accept: 'application/pdf' },
      },
    );
    const blob = response.data;
    if (blob.type.includes('json')) {
      const payload = JSON.parse(await blob.text()) as { message?: string };
      throw new Error(payload.message ?? 'Unable to download challan PDF');
    }
    const disposition = String(response.headers['content-disposition'] ?? '');
    const match = disposition.match(/filename="([^"]+)"/);
    return { blob, filename: match?.[1] ?? `${orderNumber}-challan.pdf` };
  },
};
