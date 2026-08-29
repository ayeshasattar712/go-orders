import { apiClient } from '@/lib/axios';
import type { CreateClientLoginInput, CreateStaffInput, UpdateUserInput } from '@/schemas/user.schema';
import type { User } from '@/types/auth';
import type { ApiSuccessResponse } from '@/types/api';

export interface IssuedCredentials {
  email: string;
  password: string;
  loginUrl: string;
}

export const usersService = {
  async list(type?: 'staff' | 'customer') {
    const { data } = await apiClient.get<ApiSuccessResponse<{ users: User[] }>>('/users', {
      params: type ? { type } : undefined,
    });
    return data.data.users;
  },

  async create(payload: CreateStaffInput) {
    const { data } = await apiClient.post<
      ApiSuccessResponse<{ user: User; credentials: IssuedCredentials }>
    >('/users', payload);
    return data.data;
  },

  async createClientLogin(payload: CreateClientLoginInput) {
    const { data } = await apiClient.post<
      ApiSuccessResponse<{ user: User; credentials: IssuedCredentials }>
    >('/users', { kind: 'client', ...payload });
    return data.data;
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
