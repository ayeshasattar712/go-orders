import { apiClient } from '@/lib/axios';
import type { Category } from '@/types/catalog';
import type { ApiSuccessResponse } from '@/types/api';
import type { CreateCategoryInput, UpdateCategoryInput } from '@/schemas/category.schema';

export const categoriesService = {
  async list() {
    const { data } =
      await apiClient.get<ApiSuccessResponse<{ categories: Category[] }>>('/categories');
    return data.data.categories;
  },

  async create(payload: CreateCategoryInput) {
    const { data } = await apiClient.post<ApiSuccessResponse<{ category: Category }>>(
      '/categories',
      payload,
    );
    return data.data.category;
  },

  async update(id: string, payload: UpdateCategoryInput) {
    const { data } = await apiClient.patch<ApiSuccessResponse<{ category: Category }>>(
      `/categories/${id}`,
      payload,
    );
    return data.data.category;
  },

  async remove(id: string) {
    await apiClient.delete(`/categories/${id}`);
  },
};
