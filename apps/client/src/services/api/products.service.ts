import { apiClient } from '@/lib/axios';
import type { Product } from '@/types/catalog';
import type { ApiSuccessResponse } from '@/types/api';

export const productsService = {
  async list() {
    const { data } = await apiClient.get<ApiSuccessResponse<{ products: Product[] }>>('/products');
    return data.data.products;
  },
};
