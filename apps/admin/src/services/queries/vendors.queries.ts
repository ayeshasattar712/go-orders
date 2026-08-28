import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { vendorsService } from '@/services/api';
import type { UpdateVendorInput } from '@/schemas/vendor.schema';

export const vendorKeys = {
  all: ['vendors'] as const,
  list: () => [...vendorKeys.all, 'list'] as const,
};

export function useVendors() {
  return useQuery({
    queryKey: vendorKeys.list(),
    queryFn: () => vendorsService.list(),
  });
}

export function useRegisterVendor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: vendorsService.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: vendorKeys.all }),
  });
}

export function useUpdateVendor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: UpdateVendorInput & { id: string }) =>
      vendorsService.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: vendorKeys.all }),
  });
}

export function useDeleteVendor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: vendorsService.remove,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: vendorKeys.all }),
  });
}
