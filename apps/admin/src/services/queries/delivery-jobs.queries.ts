import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { deliveryJobsService } from '@/services/api';

export const deliveryJobKeys = {
  all: ['delivery-jobs'] as const,
  list: () => [...deliveryJobKeys.all, 'list'] as const,
};

export function useDeliveryJobs() {
  return useQuery({
    queryKey: deliveryJobKeys.list(),
    queryFn: () => deliveryJobsService.list(),
  });
}

export function useRecordDeliveryAttempt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { jobId: string; outcome: 'success' | 'failed'; reason?: string }) =>
      deliveryJobsService.recordAttempt(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deliveryJobKeys.all });
    },
  });
}
