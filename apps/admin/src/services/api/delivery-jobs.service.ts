import { apiClient } from '@/lib/axios';
import type { DeliveryJob } from '@/types/enterprise';
import type { ApiSuccessResponse } from '@/types/api';

export const deliveryJobsService = {
  async list() {
    const { data } =
      await apiClient.get<ApiSuccessResponse<{ jobs: DeliveryJob[] }>>('/delivery-jobs');
    return data.data.jobs;
  },

  async update(id: string, payload: Partial<DeliveryJob>) {
    const { data } = await apiClient.patch<ApiSuccessResponse<{ job: DeliveryJob }>>(
      `/delivery-jobs?id=${id}`,
      payload,
    );
    return data.data.job;
  },

  async recordAttempt(payload: { jobId: string; outcome: 'success' | 'failed'; reason?: string }) {
    const { data } = await apiClient.post<ApiSuccessResponse<{ job: DeliveryJob }>>(
      '/delivery-jobs/attempts',
      payload,
    );
    return data.data.job;
  },
};
