import { apiClient } from '@/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';

export interface MonthlyRevenueResponse {
  month: string;
  revenue: number;
  profit: number;
  expenses: number;
}

export interface CategoryRevenueResponse {
  label: string;
  value: number;
}

export interface VendorPerformanceResponse {
  label: string;
  value: number;
}

export const analyticsService = {
  async monthlyRevenue() {
    const { data } = await apiClient.get<
      ApiSuccessResponse<{ monthlyRevenue: MonthlyRevenueResponse[] }>
    >('/analytics/monthly-revenue');
    return data.data.monthlyRevenue;
  },

  async categoryRevenue() {
    const { data } = await apiClient.get<
      ApiSuccessResponse<{ categoryRevenue: CategoryRevenueResponse[] }>
    >('/analytics/category-revenue');
    return data.data.categoryRevenue;
  },

  async vendorPerformance() {
    const { data } = await apiClient.get<
      ApiSuccessResponse<{ vendorPerformanceScores: VendorPerformanceResponse[] }>
    >('/analytics/vendor-performance');
    return data.data.vendorPerformanceScores;
  },
};
