'use client';

import { create } from 'zustand';

interface AuthPromptState {
  isOpen: boolean;
  reason: string | null;
  tab: 'login' | 'register';
  open: (reason?: string, tab?: 'login' | 'register') => void;
  close: () => void;
  setTab: (tab: 'login' | 'register') => void;
}

export const useAuthPromptStore = create<AuthPromptState>((set) => ({
  isOpen: false,
  reason: null,
  tab: 'login',
  open: (reason, tab = 'login') => set({ isOpen: true, reason: reason ?? null, tab }),
  close: () => set({ isOpen: false, reason: null }),
  setTab: (tab) => set({ tab }),
}));
