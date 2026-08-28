import { apiClient } from '@/lib/axios';
import type { DemandForecastItem } from '@/types/enterprise';
import type { ApiSuccessResponse } from '@/types/api';

export const demandForecastsService = {
  async list() {
    const { data } =
      await apiClient.get<ApiSuccessResponse<{ items: DemandForecastItem[] }>>('/demand-forecasts');
    return data.data.items;
  },
};
