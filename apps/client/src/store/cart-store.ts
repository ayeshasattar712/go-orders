'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '@/types/catalog';

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  unit: string;
  vendorId: string;
  minOrderQty: number;
  savedForLater?: boolean;
}

interface CartState {
  items: CartItem[];
  couponCode: string | null;
  /** Always adds exactly 1 unit. */
  addItem: (product: Product) => void;
  /** Adds an explicit quantity (product detail qty picker only). */
  addItemQty: (product: Product, quantity: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  saveForLater: (productId: string) => void;
  moveToCart: (productId: string) => void;
  applyCoupon: (code: string) => void;
  removeCoupon: () => void;
  clearCart: () => void;
}

function normalizeQty(quantity: unknown): number {
  if (typeof quantity !== 'number' || !Number.isFinite(quantity)) return 1;
  return Math.max(1, Math.min(999, Math.floor(quantity)));
}

function upsertProduct(product: Product, qty: number, items: CartItem[]): CartItem[] {
  const existing = items.find((item) => item.productId === product.id);
  if (existing) {
    return items.map((item) =>
      item.productId === product.id
        ? { ...item, quantity: item.quantity + qty, savedForLater: false }
        : item,
    );
  }

  return [
    ...items,
    {
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.images[0] ?? '',
      price: product.price,
      quantity: qty,
      unit: product.unit,
      vendorId: product.vendorId,
      minOrderQty: 1,
    },
  ];
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      couponCode: null,

      addItem: (product) => {
        set({ items: upsertProduct(product, 1, get().items) });
      },

      addItemQty: (product, quantity) => {
        set({ items: upsertProduct(product, normalizeQty(quantity), get().items) });
      },

      removeItem: (productId) => {
        set({ items: get().items.filter((item) => item.productId !== productId) });
      },

      updateQuantity: (productId, quantity) => {
        set({
          items: get().items.map((item) =>
            item.productId === productId
              ? { ...item, quantity: normalizeQty(quantity) }
              : item,
          ),
        });
      },

      saveForLater: (productId) => {
        set({
          items: get().items.map((item) =>
            item.productId === productId ? { ...item, savedForLater: true } : item,
          ),
        });
      },

      moveToCart: (productId) => {
        set({
          items: get().items.map((item) =>
            item.productId === productId ? { ...item, savedForLater: false } : item,
          ),
        });
      },

      applyCoupon: (code) => set({ couponCode: code }),
      removeCoupon: () => set({ couponCode: null }),
      clearCart: () => set({ items: [], couponCode: null }),
    }),
    { name: 'goorder-cart-v3' },
  ),
);

export function useCartSummary() {
  const items = useCartStore((state) => state.items);
  const activeItems = items.filter((item) => !item.savedForLater);
  const subtotal = activeItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = activeItems.reduce((sum, item) => sum + item.quantity, 0);
  return { items: activeItems, subtotal, itemCount };
}
