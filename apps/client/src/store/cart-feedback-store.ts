'use client';

import { create } from 'zustand';
import type { Product } from '@/types/catalog';
import { useCartStore } from '@/store/cart-store';

type CartFeedbackState = {
  message: string | null;
  pulseKey: number;
  notifyAdded: (productName: string) => void;
  clear: () => void;
};

export const useCartFeedbackStore = create<CartFeedbackState>((set) => ({
  message: null,
  pulseKey: 0,
  notifyAdded: (productName) =>
    set((state) => ({
      message: `${productName} added to cart`,
      pulseKey: state.pulseKey + 1,
    })),
  clear: () => set({ message: null }),
}));

/** Product cards / category: always +1 only. */
export function addProductToCart(product: Product) {
  useCartStore.getState().addItem(product);
  useCartFeedbackStore.getState().notifyAdded(product.name);
}

/** Product detail qty picker only. */
export function addProductToCartQty(product: Product, quantity: number) {
  const qty =
    typeof quantity === 'number' && Number.isFinite(quantity)
      ? Math.max(1, Math.floor(quantity))
      : 1;
  useCartStore.getState().addItemQty(product, qty);
  useCartFeedbackStore.getState().notifyAdded(product.name);
}
