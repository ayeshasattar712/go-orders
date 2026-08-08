import { apiClient } from '@/lib/axios';
import type { User } from '@/types/auth';
import type { ApiSuccessResponse } from '@/types/api';

export const usersService = {
  async list() {
    const { data } = await apiClient.get<ApiSuccessResponse<{ users: User[] }>>('/users');
    return data.data.users;
  },
};
