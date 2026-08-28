import { apiClient } from '@/lib/axios';
import type { InventoryItem } from '@/types/enterprise';
import type { ApiSuccessResponse } from '@/types/api';

export const inventoryItemsService = {
  async list() {
    const { data } =
      await apiClient.get<ApiSuccessResponse<{ items: InventoryItem[] }>>('/inventory-items');
    return data.data.items;
  },
};
