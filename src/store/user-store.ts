'use client';

import { create } from 'zustand';
import type { User } from '@/types/auth';

interface UserState {
  users: User[];
  selectedUser: User | null;
  setUsers: (users: User[]) => void;
  setSelectedUser: (user: User | null) => void;
  clear: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  users: [],
  selectedUser: null,
  setUsers: (users) => set({ users }),
  setSelectedUser: (selectedUser) => set({ selectedUser }),
  clear: () => set({ users: [], selectedUser: null }),
}));
