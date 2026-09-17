'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { applyPalette, DEFAULT_PALETTE_ID } from '@/lib/palettes';

interface PaletteState {
  paletteId: string;
  setPalette: (id: string) => void;
}

export const usePaletteStore = create<PaletteState>()(
  persist(
    (set) => ({
      paletteId: DEFAULT_PALETTE_ID,
      setPalette: (id) => {
        applyPalette(id);
        set({ paletteId: id });
      },
    }),
    {
      name: 'goorder-palette',
      onRehydrateStorage: () => (state) => {
        if (state) applyPalette(state.paletteId);
      },
    },
  ),
);
