import type { Category } from '@/types/catalog';

/** Local stationery assets — avoids broken/cached remote URLs. */
export const OFFICE_SUPPLIES_IMAGE = '/images/categories/office-supplies.jpg';
export const OFFICE_PENS_IMAGE = '/images/categories/office-pens.jpg';
export const IT_EQUIPMENT_IMAGE = '/images/categories/it-equipment.jpg';

export interface CategoryChild {
  name: string;
  slug: string;
}

export const categoryChildren: Record<string, CategoryChild[]> = {
  'office-furniture': [
    { name: 'Desks & tables', slug: 'desks' },
    { name: 'Office chairs', slug: 'chairs' },
    { name: 'Sofas & lounge', slug: 'sofas' },
    { name: 'Conference tables', slug: 'conference' },
    { name: 'Filing cabinets', slug: 'cabinets' },
    { name: 'Shelving & storage', slug: 'shelving' },
  ],
  'grocery-pantry': [
    { name: 'Coffee & tea', slug: 'coffee' },
    { name: 'Snacks', slug: 'snacks' },
    { name: 'Water & beverages', slug: 'beverages' },
    { name: 'Pantry staples', slug: 'pantry' },
    { name: 'Breakroom supplies', slug: 'breakroom' },
  ],
  'office-supplies': [
    { name: 'Copy paper', slug: 'paper' },
    { name: 'Pens & writing', slug: 'pens' },
    { name: 'Binders & files', slug: 'binders' },
    { name: 'Printer ink', slug: 'ink' },
    { name: 'Sticky notes', slug: 'notes' },
  ],
  'it-equipment': [
    { name: 'Laptops', slug: 'laptops' },
    { name: 'Monitors', slug: 'monitors' },
    { name: 'Networking', slug: 'networking' },
    { name: 'Peripherals', slug: 'peripherals' },
    { name: 'Storage & servers', slug: 'storage' },
  ],
  'cleaning-supplies': [
    { name: 'Disinfectants', slug: 'disinfectants' },
    { name: 'Trash liners', slug: 'liners' },
    { name: 'Mops & tools', slug: 'mops' },
    { name: 'Paper products', slug: 'paper-products' },
    { name: 'Floor care', slug: 'floor' },
  ],
  'electrical-products': [
    { name: 'Lighting', slug: 'lighting' },
    { name: 'Wiring & cable', slug: 'wiring' },
    { name: 'Circuit protection', slug: 'circuit' },
    { name: 'Power distribution', slug: 'power' },
    { name: 'Switches & outlets', slug: 'switches' },
  ],
};

export function getCategoryChildren(slug: string): CategoryChild[] {
  return categoryChildren[slug] ?? [];
}

export const categories: Category[] = [
  {
    id: 'cat_furniture',
    name: 'Office Furniture',
    slug: 'office-furniture',
    icon: 'Armchair',
    productCount: 110,
    image:
      'https://images.unsplash.com/photo-1497366216548-37526070297c?q=85&w=1400&auto=format&fit=crop',
    description: 'Ergonomic desks, chairs, and workspace furniture for modern offices.',
    status: 'active',
  },
  {
    id: 'cat_grocery',
    name: 'Grocery & Pantry',
    slug: 'grocery-pantry',
    icon: 'ShoppingBasket',
    productCount: 110,
    image:
      'https://images.unsplash.com/photo-1578916171728-46686eac8d58?q=85&w=1400&auto=format&fit=crop',
    description: 'Bulk pantry staples, beverages, and breakroom supplies.',
    status: 'active',
  },
  {
    id: 'cat_office',
    name: 'Office Supplies',
    slug: 'office-supplies',
    icon: 'Paperclip',
    productCount: 110,
    image: OFFICE_SUPPLIES_IMAGE,
    description: 'Stationery, paper, printing, and everyday office essentials.',
    status: 'active',
  },
  {
    id: 'cat_it',
    name: 'IT Equipment',
    slug: 'it-equipment',
    icon: 'Laptop',
    productCount: 110,
    image: IT_EQUIPMENT_IMAGE,
    description: 'Laptops, monitors, networking gear, and peripherals at scale.',
    status: 'active',
  },
  {
    id: 'cat_cleaning',
    name: 'Cleaning Supplies',
    slug: 'cleaning-supplies',
    icon: 'SprayCan',
    productCount: 110,
    image:
      'https://images.unsplash.com/photo-1563453392212-326f5e854473?q=85&w=1400&auto=format&fit=crop',
    description: 'Janitorial supplies, disinfectants, and facility maintenance products.',
    status: 'active',
  },
  {
    id: 'cat_electrical',
    name: 'Electrical Products',
    slug: 'electrical-products',
    icon: 'Plug',
    productCount: 110,
    image:
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=85&w=1400&auto=format&fit=crop',
    description: 'Wiring, lighting, circuit protection, and electrical hardware.',
    status: 'active',
  },
];

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((category) => category.slug === slug);
}

/** Extra photos shown as small thumbnails under the category hero image. */
export const categoryGalleryImages: Record<string, string[]> = {
  'office-furniture': [
    '/images/products/office-chair.jpg',
    'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1497366216548-37526070297c?q=85&w=1400&auto=format&fit=crop',
  ],
  'grocery-pantry': [
    'https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1511920170033-f8396924c348?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=1200&auto=format&fit=crop',
    '/images/products/seekh-kabab.png',
  ],
  'office-supplies': [
    OFFICE_SUPPLIES_IMAGE,
    OFFICE_PENS_IMAGE,
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=85&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1583484963886-cfe2bff2945f?q=85&w=800&auto=format&fit=crop',
  ],
  'it-equipment': [
    IT_EQUIPMENT_IMAGE,
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=85&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=85&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=85&w=800&auto=format&fit=crop',
  ],
  'cleaning-supplies': [
    'https://images.unsplash.com/photo-1563453392212-326f5e854473?q=85&w=1400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1583947215259-38e31be8751f?q=85&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1550963295-019d8a8a61c5?q=80&w=1200&auto=format&fit=crop',
  ],
  'electrical-products': [
    'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=85&w=1400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=85&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1585338447937-7082f8fc763d?q=85&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?q=80&w=1200&auto=format&fit=crop',
  ],
};

export function getCategoryGalleryImages(slug: string, fallback?: string): string[] {
  const extras = categoryGalleryImages[slug] ?? [];
  return Array.from(new Set([fallback, ...extras].filter((src): src is string => Boolean(src))));
}

export const SUBCATEGORY_KEYWORDS: Record<string, string[]> = {
  desks: ['desk'],
  chairs: ['chair'],
  sofas: ['sofa', 'lounge'],
  conference: ['conference', 'desk'],
  cabinets: ['cabinet', 'filing'],
  shelving: ['shelving', 'storage'],
  coffee: ['coffee', 'tea'],
  snacks: ['snack', 'kabab'],
  beverages: ['water'],
  pantry: ['oil', 'masala', 'noodle', 'tea', 'pantry'],
  breakroom: ['breakroom', 'snack', 'coffee'],
  paper: ['paper'],
  pens: ['pen'],
  binders: ['binder', 'file'],
  ink: ['ink', 'paper'],
  notes: ['note', 'pen'],
  laptops: ['laptop'],
  monitors: ['monitor'],
  networking: ['switch', 'network'],
  peripherals: ['laptop', 'monitor'],
  storage: ['storage', 'switch'],
  disinfectants: ['disinfectant', 'handwash'],
  liners: ['liner', 'trash'],
  mops: ['microfiber', 'cloth'],
  'paper-products': ['cloth', 'liner'],
  floor: ['microfiber'],
  lighting: ['led', 'light', 'panel'],
  wiring: ['wire'],
  circuit: ['surge', 'switch'],
  power: ['surge', 'power', 'pdu'],
  switches: ['switch', 'outlet'],
};

export interface HomeCategoryTile {
  name: string;
  parentSlug: string;
  sub: string;
  image: string;
  accent?: string;
}

export const homeCategoryTiles: HomeCategoryTile[] = [
  {
    name: 'Office chairs',
    parentSlug: 'office-furniture',
    sub: 'chairs',
    accent: 'bg-[#eef2ff]',
    image: '/images/products/office-chair.jpg',
  },
  {
    name: 'Desks & tables',
    parentSlug: 'office-furniture',
    sub: 'desks',
    accent: 'bg-[#ecfeff]',
    image: 'https://images.unsplash.com/photo-1611269154421-4e27233ac5c7?q=85&w=800&auto=format&fit=crop',
  },
  {
    name: 'Shelving & storage',
    parentSlug: 'office-furniture',
    sub: 'shelving',
    accent: 'bg-[#f5f3ff]',
    image: 'https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?q=85&w=800&auto=format&fit=crop',
  },
  {
    name: 'Laptops',
    parentSlug: 'it-equipment',
    sub: 'laptops',
    accent: 'bg-[#f1f5f9]',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=85&w=800&auto=format&fit=crop',
  },
  {
    name: 'Monitors',
    parentSlug: 'it-equipment',
    sub: 'monitors',
    accent: 'bg-[#e0f2fe]',
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=85&w=800&auto=format&fit=crop',
  },
  {
    name: 'Networking',
    parentSlug: 'it-equipment',
    sub: 'networking',
    accent: 'bg-[#ecfdf5]',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=85&w=800&auto=format&fit=crop',
  },
  {
    name: 'Copy paper',
    parentSlug: 'office-supplies',
    sub: 'paper',
    accent: 'bg-[#fff7ed]',
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=85&w=800&auto=format&fit=crop',
  },
  {
    name: 'Pens & writing',
    parentSlug: 'office-supplies',
    sub: 'pens',
    accent: 'bg-[#fdf4ff]',
    image: 'https://images.unsplash.com/photo-1583484963886-cfe2bff2945f?q=85&w=800&auto=format&fit=crop',
  },
  {
    name: 'Coffee & tea',
    parentSlug: 'grocery-pantry',
    sub: 'coffee',
    accent: 'bg-[#fff1e6]',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=85&w=800&auto=format&fit=crop',
  },
  {
    name: 'Snacks',
    parentSlug: 'grocery-pantry',
    sub: 'snacks',
    accent: 'bg-[#fef3c7]',
    image: '/images/products/seekh-kabab.png',
  },
  {
    name: 'Water & beverages',
    parentSlug: 'grocery-pantry',
    sub: 'beverages',
    accent: 'bg-[#e0f2fe]',
    image: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?q=85&w=800&auto=format&fit=crop',
  },
  {
    name: 'Pantry staples',
    parentSlug: 'grocery-pantry',
    sub: 'pantry',
    accent: 'bg-[#fefce8]',
    image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?q=85&w=800&auto=format&fit=crop',
  },
  {
    name: 'Disinfectants',
    parentSlug: 'cleaning-supplies',
    sub: 'disinfectants',
    accent: 'bg-[#ecfeff]',
    image: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?q=85&w=800&auto=format&fit=crop',
  },
  {
    name: 'Cleaning cloths',
    parentSlug: 'cleaning-supplies',
    sub: 'mops',
    accent: 'bg-[#f0fdfa]',
    image: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?q=85&w=800&auto=format&fit=crop',
  },
  {
    name: 'LED lighting',
    parentSlug: 'electrical-products',
    sub: 'lighting',
    accent: 'bg-[#fef9c3]',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=85&w=800&auto=format&fit=crop',
  },
  {
    name: 'Power & wiring',
    parentSlug: 'electrical-products',
    sub: 'power',
    accent: 'bg-[#f1f5f9]',
    image: 'https://images.unsplash.com/photo-1585338447937-7082f8fc763d?q=85&w=800&auto=format&fit=crop',
  },
];
