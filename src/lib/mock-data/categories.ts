import type { Category } from '@/types/catalog';

export const categories: Category[] = [
  {
    id: 'cat_furniture',
    name: 'Office Furniture',
    slug: 'office-furniture',
    icon: 'Armchair',
    productCount: 1284,
    image:
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=800&auto=format&fit=crop',
    description: 'Ergonomic desks, chairs, and workspace furniture for modern offices.',
    status: 'active',
  },
  {
    id: 'cat_grocery',
    name: 'Grocery & Pantry',
    slug: 'grocery-pantry',
    icon: 'ShoppingBasket',
    productCount: 3420,
    image:
      'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=800&auto=format&fit=crop',
    description: 'Bulk pantry staples, beverages, and breakroom supplies.',
    status: 'active',
  },
  {
    id: 'cat_office',
    name: 'Office Supplies',
    slug: 'office-supplies',
    icon: 'Paperclip',
    productCount: 2765,
    image:
      'https://images.unsplash.com/photo-1583225214464-9296029427aa?q=80&w=800&auto=format&fit=crop',
    description: 'Stationery, paper, printing, and everyday office essentials.',
    status: 'active',
  },
  {
    id: 'cat_it',
    name: 'IT Equipment',
    slug: 'it-equipment',
    icon: 'Laptop',
    productCount: 986,
    image:
      'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop',
    description: 'Laptops, monitors, networking gear, and peripherals at scale.',
    status: 'active',
  },
  {
    id: 'cat_cleaning',
    name: 'Cleaning Supplies',
    slug: 'cleaning-supplies',
    icon: 'SprayCan',
    productCount: 1543,
    image:
      'https://images.unsplash.com/photo-1563453392212-326f5e854473?q=80&w=800&auto=format&fit=crop',
    description: 'Janitorial supplies, disinfectants, and facility maintenance products.',
    status: 'active',
  },
  {
    id: 'cat_electrical',
    name: 'Electrical Products',
    slug: 'electrical-products',
    icon: 'Plug',
    productCount: 872,
    image:
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=800&auto=format&fit=crop',
    description: 'Wiring, lighting, circuit protection, and electrical hardware.',
    status: 'active',
  },
];

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((category) => category.slug === slug);
}
