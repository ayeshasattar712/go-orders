import type { Product } from '@/types/catalog';
import { categoryChildren } from './categories';

function bulkTiers(base: number) {
  return [
    { minQty: 1, maxQty: 9, price: base },
    { minQty: 10, maxQty: 49, price: Number((base * 0.92).toFixed(2)) },
    { minQty: 50, maxQty: 199, price: Number((base * 0.85).toFixed(2)) },
    { minQty: 200, maxQty: null, price: Number((base * 0.78).toFixed(2)) },
  ];
}

type CategoryBlueprint = {
  categoryId: string;
  categorySlug: string;
  vendorId: string;
  skuPrefix: string;
  unit: string;
  basePrice: number;
  images: string[];
  names: string[];
  colors: string[] | null;
  materials: string[];
};

const blueprints: CategoryBlueprint[] = [
  {
    categoryId: 'cat_furniture',
    categorySlug: 'office-furniture',
    vendorId: 'vnd_apex',
    skuPrefix: 'FURN',
    unit: 'unit',
    basePrice: 189,
    colors: ['Black', 'Grey', 'Walnut Brown', 'White', 'Navy Blue'],
    materials: ['Mesh', 'Leather', 'Fabric', 'Solid Wood', 'Metal Frame', 'Laminate'],
    images: [
      '/images/products/office-chair.jpg',
      'https://images.unsplash.com/photo-1592078615290-033ee584e267?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1611269154421-4e27233ac5c7?q=85&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?q=85&w=1200&auto=format&fit=crop',
    ],
    names: [
      'ErgoMesh Task Chair',
      'Executive Leather Office Chair',
      'Sit-Stand Height Desk',
      'Conference Meeting Desk',
      'Modular Storage Shelving',
      'Filing Cabinet Drawer Unit',
      'Lounge Sofa Set',
      'Visitor Guest Chair',
      'Workstation Bench Desk',
      'Mobile Pedestal Cabinet',
    ],
  },
  {
    categoryId: 'cat_grocery',
    categorySlug: 'grocery-pantry',
    vendorId: 'vnd_freshstock',
    skuPrefix: 'GROC',
    unit: 'case',
    basePrice: 24,
    colors: null,
    materials: ['Carton', 'Plastic Bottle', 'Glass Jar', 'Tin Can', 'Sachet Pack'],
    images: [
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1544787219-7f47ccb76574?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600271886742-f049cd451bba?q=80&w=1200&auto=format&fit=crop',
    ],
    names: [
      'Arabica Coffee Beans Pack',
      'Green Tea Assortment Box',
      'Office Snack Mix Case',
      'Still Water Bottle Pack',
      'Pantry Cooking Oil Jug',
      'Instant Noodle Bulk Pack',
      'Breakroom Biscuit Assortment',
      'Masala Seasoning Kit',
      'Herbal Tea Sampler',
      'Protein Snack Bars Carton',
    ],
  },
  {
    categoryId: 'cat_office',
    categorySlug: 'office-supplies',
    vendorId: 'vnd_apex',
    skuPrefix: 'SUPP',
    unit: 'pack',
    basePrice: 18,
    colors: ['Black', 'Blue', 'Red', 'White', 'Multicolor'],
    materials: ['Paper', 'Plastic', 'Metal', 'Recycled Paper'],
    images: [
      '/images/categories/office-supplies.jpg',
      '/images/categories/office-pens.jpg',
      'https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?q=80&w=1200&auto=format&fit=crop',
    ],
    names: [
      'A4 Multipurpose Copy Paper',
      'Gel Ink Pen Pack',
      'Ring Binder File Set',
      'Printer Ink Cartridge Twin',
      'Sticky Notes Cube Pack',
      'Highlighter Marker Set',
      'Document File Folder Box',
      'Ballpoint Pen Value Pack',
      'Notebook Spiral Bundle',
      'Desk Organizer Tray Kit',
    ],
  },
  {
    categoryId: 'cat_it',
    categorySlug: 'it-equipment',
    vendorId: 'vnd_technova',
    skuPrefix: 'ITEQ',
    unit: 'unit',
    basePrice: 420,
    colors: ['Black', 'Silver', 'White', 'Space Grey'],
    materials: ['Aluminum', 'Plastic', 'Steel', 'Polycarbonate'],
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?q=80&w=1200&auto=format&fit=crop',
    ],
    names: [
      'Business Laptop 14-inch',
      'Ultrawide Office Monitor',
      'Gigabit Network Switch',
      'Wireless Peripheral Kit',
      'NAS Storage Appliance',
      'Docking Station Hub',
      'Laptop Dock Bundle',
      'Full HD Monitor Stand',
      'Managed Network Switch',
      'SSD Storage Expansion',
    ],
  },
  {
    categoryId: 'cat_cleaning',
    categorySlug: 'cleaning-supplies',
    vendorId: 'vnd_clearline',
    skuPrefix: 'CLEN',
    unit: 'case',
    basePrice: 16,
    colors: ['Blue', 'Green', 'Yellow', 'White'],
    materials: ['Plastic', 'Microfiber', 'Cotton', 'Biodegradable'],
    images: [
      'https://images.unsplash.com/photo-1585421514738-0179e5f0f0d8?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1563453392212-326f255e7e7b?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1583947215259-38e31be8751f?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1556911220-bff31c28c827?q=80&w=1200&auto=format&fit=crop',
    ],
    names: [
      'Surface Disinfectant Spray',
      'Antibacterial Handwash Refill',
      'Heavy Duty Trash Liner Roll',
      'Microfiber Cleaning Cloth Pack',
      'Commercial Mop Head Bundle',
      'Floor Care Concentrate',
      'Disinfectant Wipes Canister',
      'Paper Towel Facility Pack',
      'Trash Liner Jumbo Roll',
      'Floor Polish Pad Kit',
    ],
  },
  {
    categoryId: 'cat_electrical',
    categorySlug: 'electrical-products',
    vendorId: 'vnd_voltedge',
    skuPrefix: 'ELEC',
    unit: 'unit',
    basePrice: 55,
    colors: ['White', 'Black', 'Grey'],
    materials: ['Copper', 'PVC', 'Aluminum', 'Plastic'],
    images: [
      'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?q=80&w=1200&auto=format&fit=crop',
    ],
    names: [
      'Commercial LED Panel Light',
      'Copper Wiring Cable Reel',
      'Surge Protection Switch',
      'PDU Power Distribution Unit',
      'Wall Outlet Switch Plate',
      'LED Tube Light Pack',
      'Circuit Breaker Panel',
      'Power Extension Strip',
      'Industrial Wire Bundle',
      'Smart Switch Outlet Kit',
    ],
  },
];

const TARGET_PER_CATEGORY = 110;

/** Fills each category to TARGET_PER_CATEGORY+ SKUs for shop browsing. */
export function buildGeneratedCatalog(existing: Product[]): Product[] {
  const generated: Product[] = [];

  for (const blueprint of blueprints) {
    const have = existing.filter((p) => p.categorySlug === blueprint.categorySlug).length;
    const need = Math.max(0, TARGET_PER_CATEGORY - have);
    const children = categoryChildren[blueprint.categorySlug] ?? [];

    for (let i = 0; i < need; i++) {
      const n = i + 1;
      const nameBase = blueprint.names[i % blueprint.names.length]!;
      const child = children[i % Math.max(children.length, 1)];
      const price = Number(
        (blueprint.basePrice + (i % 17) * (blueprint.basePrice * 0.07) + (i % 5) * 3.25).toFixed(2),
      );
      const compareAt = Number((price * (1.12 + (i % 4) * 0.03)).toFixed(2));
      const id = `prod_gen_${blueprint.categorySlug}_${String(n).padStart(3, '0')}`;
      const slug = `${blueprint.categorySlug}-${nameBase.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${n}`;
      const sku = `GO-${blueprint.skuPrefix}-${1000 + n}`;
      const image = blueprint.images[i % blueprint.images.length]!;
      const subTag = child?.slug ?? 'general';

      generated.push({
        id,
        slug,
        name: `${nameBase} ${n}`,
        shortDescription: `Business-ready ${nameBase.toLowerCase()} for everyday procurement.`,
        description: `${nameBase} ${n} is stocked for bulk workplace ordering. Suitable for offices, facilities, and recurring replenishment with tiered pricing.`,
        images: [image],
        categoryId: blueprint.categoryId,
        categorySlug: blueprint.categorySlug,
        vendorId: blueprint.vendorId,
        price,
        compareAtPrice: i % 3 === 0 ? compareAt : undefined,
        currency: 'PKR',
        rating: Number((3.9 + (i % 11) * 0.1).toFixed(1)),
        reviewCount: 20 + (i % 90) * 7,
        stock: 50 + (i % 40) * 25,
        stockStatus: i % 29 === 0 ? 'low-stock' : 'in-stock',
        sku,
        unit: blueprint.unit,
        minOrderQty: 1,
        bulkPricing: bulkTiers(price),
        specifications: [
          { label: 'SKU series', value: sku },
          { label: 'Category', value: blueprint.categorySlug },
          { label: 'Subcategory', value: child?.name ?? 'General' },
        ],
        color: blueprint.colors ? blueprint.colors[i % blueprint.colors.length]! : null,
        material: blueprint.materials[i % blueprint.materials.length]!,
        tags: [subTag, 'catalog', blueprint.categorySlug, nameBase.split(' ')[0]!.toLowerCase()],
        isBestSeller: i % 11 === 0,
        isTrending: i % 13 === 0,
        isNew: i % 17 === 0,
        deliveryEstimateDays: 2 + (i % 5),
        reviews: [
          {
            id: `${id}_rev_1`,
            author: 'Procurement Team',
            rating: 5,
            date: new Date(Date.now() - n * 86400000).toISOString(),
            title: 'Good for bulk orders',
            body: 'Consistent quality and clear packaging for warehouse receiving.',
            verified: true,
            helpful: 3 + (i % 8),
          },
        ],
      });
    }
  }

  return generated;
}
