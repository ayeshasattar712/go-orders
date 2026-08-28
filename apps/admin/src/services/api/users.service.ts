import { apiClient } from '@/lib/axios';
import type { CreateStaffInput, UpdateUserInput } from '@/schemas/user.schema';
import type { User } from '@/types/auth';
import type { ApiSuccessResponse } from '@/types/api';

export const usersService = {
  async list() {
    const { data } = await apiClient.get<ApiSuccessResponse<{ users: User[] }>>('/users');
    return data.data.users;
  },

  async create(payload: CreateStaffInput) {
    const { data } = await apiClient.post<ApiSuccessResponse<{ user: User }>>('/users', payload);
    return data.data.user;
  },

  async update(id: string, payload: UpdateUserInput) {
    const { data } = await apiClient.patch<ApiSuccessResponse<{ user: User }>>(
      `/users/${id}`,
      payload,
    );
    return data.data.user;
  },

  async remove(id: string) {
    await apiClient.delete(`/users/${id}`);
  },
};
