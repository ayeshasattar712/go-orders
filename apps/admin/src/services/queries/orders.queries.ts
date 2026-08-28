import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ordersService } from '@/services/api';
import type { OrderStatus } from '@/types/catalog';

export const adminOrderKeys = {
  all: ['admin-orders'] as const,
  list: () => [...adminOrderKeys.all, 'list'] as const,
  detail: (orderNumber: string) => [...adminOrderKeys.all, 'detail', orderNumber] as const,
};

export function useAdminOrders() {
  return useQuery({
    queryKey: adminOrderKeys.list(),
    queryFn: () => ordersService.list(),
  });
}

export function useAdminOrder(orderNumber: string, enabled = true) {
  return useQuery({
    queryKey: adminOrderKeys.detail(orderNumber),
    queryFn: () => ordersService.get(orderNumber),
    enabled,
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderNumber, status }: { orderNumber: string; status: OrderStatus }) =>
      ordersService.updateStatus(orderNumber, status),
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: adminOrderKeys.all });
      queryClient.setQueryData(adminOrderKeys.detail(order.orderNumber), order);
    },
  });
}
