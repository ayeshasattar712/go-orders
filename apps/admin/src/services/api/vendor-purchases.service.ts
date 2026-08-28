import { apiClient } from '@/lib/axios';
import type { VendorPurchase } from '@/types/admin';
import type { ApiSuccessResponse } from '@/types/api';

export const vendorPurchasesService = {
  async list() {
    const { data } =
      await apiClient.get<ApiSuccessResponse<{ purchases: VendorPurchase[] }>>('/vendor-purchases');
    return data.data.purchases;
  },
};
