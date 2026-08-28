import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '@/services/api';

export const analyticsKeys = {
  all: ['analytics'] as const,
  monthlyRevenue: () => [...analyticsKeys.all, 'monthly-revenue'] as const,
  categoryRevenue: () => [...analyticsKeys.all, 'category-revenue'] as const,
  vendorPerformance: () => [...analyticsKeys.all, 'vendor-performance'] as const,
};

export function useMonthlyRevenue() {
  return useQuery({
    queryKey: analyticsKeys.monthlyRevenue(),
    queryFn: () => analyticsService.monthlyRevenue(),
  });
}

export function useCategoryRevenue() {
  return useQuery({
    queryKey: analyticsKeys.categoryRevenue(),
    queryFn: () => analyticsService.categoryRevenue(),
  });
}

export function useVendorPerformance() {
  return useQuery({
    queryKey: analyticsKeys.vendorPerformance(),
    queryFn: () => analyticsService.vendorPerformance(),
  });
}
