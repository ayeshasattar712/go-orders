import { apiClient } from '@/lib/axios';
import type { Order, OrderStatus } from '@/types/catalog';
import type { AdminOrder } from '@/lib/orders/order-mapper';
import type { ApiSuccessResponse } from '@/types/api';

export interface CreateOrderItemPayload {
  productId?: string;
  name: string;
  image: string;
  quantity: number;
  price: number;
}

export interface CreateOrderPayload {
  items: CreateOrderItemPayload[];
  vendorName: string;
  shipping: number;
  tax: number;
}

export const ordersService = {
  async list() {
    const { data } = await apiClient.get<ApiSuccessResponse<{ orders: AdminOrder[] }>>('/orders');
    return data.data.orders;
  },

  async get(orderNumber: string) {
    const { data } = await apiClient.get<ApiSuccessResponse<{ order: AdminOrder }>>(
      `/orders/${orderNumber}`,
    );
    return data.data.order;
  },

  async create(payload: CreateOrderPayload) {
    const { data } = await apiClient.post<ApiSuccessResponse<{ order: Order }>>('/orders', payload);
    return data.data.order;
  },

  async updateStatus(orderNumber: string, status: OrderStatus) {
    const { data } = await apiClient.patch<ApiSuccessResponse<{ order: AdminOrder }>>(
      `/orders/${orderNumber}`,
      { status },
    );
    return data.data.order;
  },
};
