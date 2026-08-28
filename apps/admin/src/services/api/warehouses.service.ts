import { apiClient } from '@/lib/axios';
import type { WarehouseStock } from '@/types/enterprise';
import type { ApiSuccessResponse } from '@/types/api';

export const warehousesService = {
  async list() {
    const { data } =
      await apiClient.get<ApiSuccessResponse<{ warehouses: WarehouseStock[] }>>('/warehouses');
    return data.data.warehouses;
  },
};
