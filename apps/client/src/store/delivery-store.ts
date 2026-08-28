'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { deliveryJobs as seedDeliveryJobs } from '@/lib/mock-data/enterprise';
import type { DeliveryJob } from '@/types/enterprise';

interface DeliveryState {
  jobs: DeliveryJob[];
  markDelivered: (id: string, markedBy: 'admin' | 'customer') => void;
  getByOrderNumber: (orderNumber: string) => DeliveryJob | undefined;
}

export const useDeliveryStore = create<DeliveryState>()(
  persist(
    (set, get) => ({
      jobs: seedDeliveryJobs,

      markDelivered: (id, markedBy) => {
        set({
          jobs: get().jobs.map((job) =>
            job.id === id
              ? {
                  ...job,
                  status: 'delivered',
                  progress: 100,
                  eta: 'Delivered',
                  deliveredBy: markedBy,
                  deliveredAt: new Date().toISOString(),
                }
              : job,
          ),
        });
      },

      getByOrderNumber: (orderNumber) => get().jobs.find((job) => job.orderNumber === orderNumber),
    }),
    { name: 'goorder-delivery' },
  ),
);
