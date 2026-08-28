import { apiClient } from '@/lib/axios';
import type { ReceivedPayment } from '@/types/enterprise';
import type { ApiSuccessResponse } from '@/types/api';

export const paymentsService = {
  async list() {
    const { data } =
      await apiClient.get<ApiSuccessResponse<{ payments: ReceivedPayment[] }>>('/payments');
    return data.data.payments;
  },

  async update(id: string, payload: { status: ReceivedPayment['status'] }) {
    const { data } = await apiClient.patch<ApiSuccessResponse<{ payment: ReceivedPayment }>>(
      `/payments/${id}`,
      payload,
    );
    return data.data.payment;
  },
};
