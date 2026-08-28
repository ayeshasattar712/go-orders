import { apiClient } from '@/lib/axios';
import type { Asset } from '@/types/enterprise';
import type { ApiSuccessResponse } from '@/types/api';

export const assetsService = {
  async list() {
    const { data } = await apiClient.get<ApiSuccessResponse<{ assets: Asset[] }>>('/assets');
    return data.data.assets;
  },
};
