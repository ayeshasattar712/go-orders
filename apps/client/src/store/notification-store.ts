'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { notifications as seedNotifications } from '@/lib/mock-data/admin';
import type { AppNotification } from '@/types/admin';

interface NotificationState {
  notifications: AppNotification[];
  markRead: (id: string) => void;
  markAllRead: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: seedNotifications,
      markRead: (id) => {
        set({
          notifications: get().notifications.map((notification) =>
            notification.id === id ? { ...notification, read: true } : notification,
          ),
        });
      },
      markAllRead: () => {
        set({
          notifications: get().notifications.map((notification) => ({
            ...notification,
            read: true,
          })),
        });
      },
    }),
    { name: 'goorder-notifications' },
  ),
);
