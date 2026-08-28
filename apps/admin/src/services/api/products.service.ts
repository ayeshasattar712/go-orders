import { apiClient } from '@/lib/axios';
import type { Product } from '@/types/catalog';
import type { ApiSuccessResponse } from '@/types/api';
import type { CreateProductInput, UpdateProductInput } from '@/schemas/product.schema';

export const productsService = {
  async list() {
    const { data } = await apiClient.get<ApiSuccessResponse<{ products: Product[] }>>('/products');
    return data.data.products;
  },

  async create(payload: CreateProductInput) {
    const { data } = await apiClient.post<ApiSuccessResponse<{ product: Product }>>(
      '/products',
      payload,
    );
    return data.data.product;
  },

  async update(id: string, payload: UpdateProductInput) {
    const { data } = await apiClient.patch<ApiSuccessResponse<{ product: Product }>>(
      `/products/${id}`,
      payload,
    );
    return data.data.product;
  },

  async remove(id: string) {
    await apiClient.delete(`/products/${id}`);
  },
};
