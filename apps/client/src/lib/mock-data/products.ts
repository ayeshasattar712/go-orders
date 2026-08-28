import type { BulkPriceTier, Product, ProductReview } from '@/types/catalog';

function bulkTiers(base: number): BulkPriceTier[] {
  return [
    { minQty: 1, maxQty: 9, price: base },
    { minQty: 10, maxQty: 49, price: Number((base * 0.92).toFixed(2)) },
    { minQty: 50, maxQty: 199, price: Number((base * 0.85).toFixed(2)) },
    { minQty: 200, maxQty: null, price: Number((base * 0.78).toFixed(2)) },
  ];
}

function reviews(seed: string, count: number): ProductReview[] {
  const templates = [
    {
      title: 'Excellent value for bulk ordering',
      body: 'We ordered for our whole regional office and the quality was consistent across every unit. Delivery was on time and packaging was solid.',
    },
    {
      title: 'Exactly as described',
      body: 'Specifications matched the listing precisely. Procurement team was happy with the documentation provided for our audit.',
    },
    {
      title: 'Reliable vendor, will reorder',
      body: 'This is our third reorder from this vendor. Consistent quality and the bulk pricing tiers make budgeting predictable.',
    },
    {
      title: 'Good but delivery took longer than estimated',
      body: 'Product quality is great, though our shipment arrived two days past the estimate. Support was responsive when we followed up.',
    },
  ];

  return Array.from({ length: count }).map((_, index) => {
    const template = templates[index % templates.length]!;
    return {
      id: `${seed}_rev_${index + 1}`,
      author: ['Morgan Lee', 'Priya Nair', 'Daniel Osei', 'Sara Kim', 'Carlos Mendes'][index % 5]!,
      rating: [5, 4, 5, 4, 5][index % 5]!,
      date: new Date(Date.now() - index * 1000 * 60 * 60 * 24 * 12).toISOString(),
      title: template.title,
      body: template.body,
      verified: index % 3 !== 0,
      helpful: 4 + index * 3,
    };
  });
}

export const products: Product[] = [
  {
    id: 'prod_ergo_chair',
    slug: 'apex-ergoflex-mesh-office-chair',
    name: 'ApexErgoFlex Mesh Office Chair',
    shortDescription: 'Adjustable lumbar support mesh chair built for full-day comfort.',
    description:
      'The ApexErgoFlex combines breathable mesh, adjustable lumbar support, and a synchro-tilt mechanism engineered for long workdays. Rated for continuous 12-hour use and backed by a 5-year warranty, it is the top choice for enterprise workstation rollouts.',
    images: [
      'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1519677100203-a0e668c92439?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1505797149-0b3f8c8b5cd3?q=80&w=1200&auto=format&fit=crop',
    ],
    categoryId: 'cat_furniture',
    categorySlug: 'office-furniture',
    vendorId: 'vnd_apex',
    price: 249.0,
    compareAtPrice: 319.0,
    currency: 'USD',
    rating: 4.7,
    reviewCount: 812,
    stock: 340,
    stockStatus: 'in-stock',
    sku: 'APX-CHR-1029',
    unit: 'unit',
    minOrderQty: 1,
    bulkPricing: bulkTiers(249.0),
    specifications: [
      { label: 'Material', value: 'Breathable mesh, aluminum base' },
      { label: 'Weight capacity', value: '300 lbs' },
      { label: 'Adjustability', value: 'Height, tilt, armrest, lumbar' },
      { label: 'Warranty', value: '5 years' },
      { label: 'Assembly', value: 'Required, tools included' },
    ],
    tags: ['ergonomic', 'best-seller', 'warranty-5yr'],
    isBestSeller: true,
    isTrending: true,
    deliveryEstimateDays: 3,
    reviews: reviews('ergo_chair', 6),
  },
  {
    id: 'prod_standing_desk',
    slug: 'apex-riseform-electric-standing-desk',
    name: 'ApexRiseForm Electric Standing Desk',
    shortDescription: 'Dual-motor height-adjustable desk with programmable memory presets.',
    description:
      'Enterprise-grade standing desk with dual-motor lift, four programmable height presets, anti-collision detection, and a scratch-resistant laminate top. Ideal for standardized office rollouts and wellness initiatives.',
    images: [
      'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?q=80&w=1200&auto=format&fit=crop',
    ],
    categoryId: 'cat_furniture',
    categorySlug: 'office-furniture',
    vendorId: 'vnd_apex',
    price: 449.0,
    compareAtPrice: 549.0,
    currency: 'USD',
    rating: 4.8,
    reviewCount: 561,
    stock: 128,
    stockStatus: 'in-stock',
    sku: 'APX-DSK-2044',
    unit: 'unit',
    minOrderQty: 1,
    bulkPricing: bulkTiers(449.0),
    specifications: [
      { label: 'Height range', value: '28" - 48"' },
      { label: 'Surface', value: '60" x 30" laminate' },
      { label: 'Lift capacity', value: '220 lbs' },
      { label: 'Presets', value: '4 programmable memory settings' },
      { label: 'Warranty', value: '7 years frame, 3 years electronics' },
    ],
    tags: ['ergonomic', 'electric', 'wellness'],
    isTrending: true,
    deliveryEstimateDays: 5,
    reviews: reviews('standing_desk', 5),
  },
  {
    id: 'prod_modular_shelving',
    slug: 'apex-modular-storage-shelving-unit',
    name: 'Apex Modular Storage Shelving Unit',
    shortDescription: 'Stackable steel shelving for archives, supply rooms, and warehouses.',
    description:
      'Heavy-duty modular shelving with powder-coated steel frame, adjustable shelf heights, and 800 lb per-shelf capacity. Designed for storage rooms, warehouses, and back-office archives.',
    images: [
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1200&auto=format&fit=crop',
    ],
    categoryId: 'cat_furniture',
    categorySlug: 'office-furniture',
    vendorId: 'vnd_apex',
    price: 189.0,
    currency: 'USD',
    rating: 4.4,
    reviewCount: 233,
    stock: 60,
    stockStatus: 'low-stock',
    sku: 'APX-SHF-3311',
    unit: 'unit',
    minOrderQty: 2,
    bulkPricing: bulkTiers(189.0),
    specifications: [
      { label: 'Material', value: 'Powder-coated steel' },
      { label: 'Shelves', value: '5 adjustable shelves' },
      { label: 'Load capacity', value: '800 lbs per shelf' },
      { label: 'Assembly', value: 'Tool-free' },
    ],
    tags: ['storage', 'warehouse'],
    deliveryEstimateDays: 6,
    reviews: reviews('modular_shelving', 4),
  },
  {
    id: 'prod_coffee_bulk',
    slug: 'freshstock-premium-arabica-coffee-5lb',
    name: 'FreshStock Premium Arabica Coffee (5 lb Bulk Bag)',
    shortDescription: '100% Arabica whole bean coffee roasted for office breakrooms.',
    description:
      'Medium-roast Arabica beans sourced from certified sustainable farms, packed in resealable 5 lb bulk bags optimized for high-volume office breakroom brewing.',
    images: [
      'https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=1200&auto=format&fit=crop',
    ],
    categoryId: 'cat_grocery',
    categorySlug: 'grocery-pantry',
    vendorId: 'vnd_freshstock',
    price: 42.5,
    compareAtPrice: 52.0,
    currency: 'USD',
    rating: 4.9,
    reviewCount: 1420,
    stock: 900,
    stockStatus: 'in-stock',
    sku: 'FSK-COF-0087',
    unit: 'bag (5 lb)',
    minOrderQty: 4,
    bulkPricing: bulkTiers(42.5),
    specifications: [
      { label: 'Roast', value: 'Medium' },
      { label: 'Origin', value: 'Colombia, single-origin' },
      { label: 'Certification', value: 'Rainforest Alliance' },
      { label: 'Shelf life', value: '12 months unopened' },
    ],
    tags: ['best-seller', 'breakroom'],
    isBestSeller: true,
    deliveryEstimateDays: 2,
    reviews: reviews('coffee_bulk', 7),
  },
  {
    id: 'prod_water_case',
    slug: 'freshstock-spring-water-24pack',
    name: 'FreshStock Purified Spring Water (24-Pack, 16.9oz)',
    shortDescription: 'Case-packed spring water for office pantries and events.',
    description:
      'BPA-free bottled spring water in convenient 24-packs, ideal for office pantries, conference rooms, and corporate events. Sourced and bottled under FDA-registered facilities.',
    images: [
      'https://images.unsplash.com/photo-1523362628745-0c100150b504?q=80&w=1200&auto=format&fit=crop',
    ],
    categoryId: 'cat_grocery',
    categorySlug: 'grocery-pantry',
    vendorId: 'vnd_freshstock',
    price: 8.99,
    currency: 'USD',
    rating: 4.6,
    reviewCount: 640,
    stock: 2200,
    stockStatus: 'in-stock',
    sku: 'FSK-WTR-0021',
    unit: 'case (24 bottles)',
    minOrderQty: 10,
    bulkPricing: bulkTiers(8.99),
    specifications: [
      { label: 'Volume', value: '16.9 fl oz per bottle' },
      { label: 'Packaging', value: 'BPA-free PET' },
      { label: 'Certification', value: 'FDA registered facility' },
    ],
    tags: ['pantry', 'events'],
    isTrending: true,
    deliveryEstimateDays: 2,
    reviews: reviews('water_case', 5),
  },
  {
    id: 'prod_snack_box',
    slug: 'freshstock-assorted-snack-box',
    name: 'FreshStock Assorted Breakroom Snack Box (60 Count)',
    shortDescription: 'Curated mix of snacks for office breakrooms and events.',
    description:
      'A curated assortment of 60 individually packaged snacks including nuts, granola bars, and dried fruit — perfect for stocking corporate breakrooms with minimal management overhead.',
    images: [
      'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?q=80&w=1200&auto=format&fit=crop',
    ],
    categoryId: 'cat_grocery',
    categorySlug: 'grocery-pantry',
    vendorId: 'vnd_freshstock',
    price: 64.0,
    currency: 'USD',
    rating: 4.5,
    reviewCount: 380,
    stock: 410,
    stockStatus: 'in-stock',
    sku: 'FSK-SNK-0143',
    unit: 'box (60 ct)',
    minOrderQty: 2,
    bulkPricing: bulkTiers(64.0),
    specifications: [
      { label: 'Count', value: '60 individually wrapped snacks' },
      { label: 'Variety', value: '12 unique items' },
      { label: 'Dietary', value: 'Nut-free options included' },
    ],
    tags: ['breakroom'],
    deliveryEstimateDays: 3,
    reviews: reviews('snack_box', 4),
  },
  {
    id: 'prod_copy_paper',
    slug: 'apex-premium-copy-paper-case',
    name: 'Apex Premium Multipurpose Copy Paper (Case of 10 Reams)',
    shortDescription: '20 lb, 92 bright multipurpose paper for everyday printing.',
    description:
      'Reliable, jam-resistant multipurpose paper engineered for high-volume office printers and copiers. 92 brightness rating ensures crisp print quality for reports and presentations.',
    images: [
      'https://images.unsplash.com/photo-1586953208448-b95a79798f07?q=80&w=1200&auto=format&fit=crop',
    ],
    categoryId: 'cat_office',
    categorySlug: 'office-supplies',
    vendorId: 'vnd_apex',
    price: 54.99,
    compareAtPrice: 64.99,
    currency: 'USD',
    rating: 4.7,
    reviewCount: 1230,
    stock: 1500,
    stockStatus: 'in-stock',
    sku: 'APX-PPR-0456',
    unit: 'case (10 reams)',
    minOrderQty: 5,
    bulkPricing: bulkTiers(54.99),
    specifications: [
      { label: 'Weight', value: '20 lb' },
      { label: 'Brightness', value: '92' },
      { label: 'Sheets per ream', value: '500' },
      { label: 'Compatibility', value: 'Laser & inkjet' },
    ],
    tags: ['best-seller', 'printing'],
    isBestSeller: true,
    deliveryEstimateDays: 2,
    reviews: reviews('copy_paper', 8),
  },
  {
    id: 'prod_pen_pack',
    slug: 'apex-gel-pen-bulk-pack',
    name: 'Apex Smooth Gel Pens (Bulk Pack of 100)',
    shortDescription: 'Quick-dry gel ink pens for daily office writing needs.',
    description:
      'Comfortable-grip gel pens with quick-dry ink to prevent smudging. Bulk pack of 100 in classic black, ideal for procurement teams standardizing office supplies.',
    images: [
      'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?q=80&w=1200&auto=format&fit=crop',
    ],
    categoryId: 'cat_office',
    categorySlug: 'office-supplies',
    vendorId: 'vnd_apex',
    price: 32.0,
    currency: 'USD',
    rating: 4.5,
    reviewCount: 512,
    stock: 3000,
    stockStatus: 'in-stock',
    sku: 'APX-PEN-0789',
    unit: 'pack (100 ct)',
    minOrderQty: 3,
    bulkPricing: bulkTiers(32.0),
    specifications: [
      { label: 'Ink', value: 'Quick-dry gel, black' },
      { label: 'Tip size', value: '0.7mm' },
      { label: 'Count', value: '100 pens per pack' },
    ],
    tags: ['stationery'],
    deliveryEstimateDays: 2,
    reviews: reviews('pen_pack', 3),
  },
  {
    id: 'prod_laptop_probook',
    slug: 'technova-probook-14-business-laptop',
    name: 'TechNova ProBook 14" Business Laptop',
    shortDescription: 'Enterprise laptop with vPro security and all-day battery.',
    description:
      'Purpose-built for enterprise fleets: 14th-gen enterprise processor, hardware security module, vPro remote manageability, and 14-hour battery life. Includes 3-year on-site warranty support.',
    images: [
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1200&auto=format&fit=crop',
    ],
    categoryId: 'cat_it',
    categorySlug: 'it-equipment',
    vendorId: 'vnd_technova',
    price: 1099.0,
    compareAtPrice: 1299.0,
    currency: 'USD',
    rating: 4.8,
    reviewCount: 940,
    stock: 210,
    stockStatus: 'in-stock',
    sku: 'TNV-LAP-5521',
    unit: 'unit',
    minOrderQty: 1,
    bulkPricing: bulkTiers(1099.0),
    specifications: [
      { label: 'Processor', value: 'Enterprise-grade, 14 cores' },
      { label: 'Memory', value: '16GB DDR5 (upgradable to 64GB)' },
      { label: 'Storage', value: '512GB NVMe SSD' },
      { label: 'Security', value: 'TPM 2.0, vPro, fingerprint reader' },
      { label: 'Warranty', value: '3-year on-site' },
    ],
    tags: ['best-seller', 'enterprise', 'security'],
    isBestSeller: true,
    isTrending: true,
    deliveryEstimateDays: 4,
    reviews: reviews('laptop_probook', 9),
  },
  {
    id: 'prod_monitor_ultra',
    slug: 'technova-ultrawide-34-monitor',
    name: 'TechNova UltraWide 34" QHD Monitor',
    shortDescription: 'Curved ultrawide display for productivity and design teams.',
    description:
      '34-inch curved QHD monitor with USB-C power delivery, KVM switch, and factory color calibration. Designed for financial analysts, designers, and multitasking power users.',
    images: [
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=1200&auto=format&fit=crop',
    ],
    categoryId: 'cat_it',
    categorySlug: 'it-equipment',
    vendorId: 'vnd_technova',
    price: 449.0,
    currency: 'USD',
    rating: 4.7,
    reviewCount: 388,
    stock: 145,
    stockStatus: 'in-stock',
    sku: 'TNV-MON-6612',
    unit: 'unit',
    minOrderQty: 1,
    bulkPricing: bulkTiers(449.0),
    specifications: [
      { label: 'Resolution', value: '3440 x 1440 QHD' },
      { label: 'Panel', value: 'Curved VA, 100Hz' },
      { label: 'Connectivity', value: 'USB-C (90W PD), HDMI, DP, KVM' },
      { label: 'Color accuracy', value: 'Factory calibrated Delta E < 2' },
    ],
    tags: ['it', 'display'],
    isTrending: true,
    deliveryEstimateDays: 4,
    reviews: reviews('monitor_ultra', 5),
  },
  {
    id: 'prod_network_switch',
    slug: 'technova-24-port-managed-switch',
    name: 'TechNova 24-Port Managed Gigabit Switch',
    shortDescription: 'Rack-mountable managed switch with PoE+ support.',
    description:
      'Enterprise-grade managed switch with 24 Gigabit ports, PoE+ support up to 370W total budget, and full L2/L3 management for structured office and warehouse networks.',
    images: [
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1200&auto=format&fit=crop',
    ],
    categoryId: 'cat_it',
    categorySlug: 'it-equipment',
    vendorId: 'vnd_technova',
    price: 389.0,
    currency: 'USD',
    rating: 4.6,
    reviewCount: 214,
    stock: 88,
    stockStatus: 'low-stock',
    sku: 'TNV-NET-7734',
    unit: 'unit',
    minOrderQty: 1,
    bulkPricing: bulkTiers(389.0),
    specifications: [
      { label: 'Ports', value: '24x Gigabit + 4x SFP+ uplink' },
      { label: 'PoE budget', value: '370W total' },
      { label: 'Management', value: 'L2/L3 managed, cloud-ready' },
      { label: 'Mounting', value: '19" rack-mountable' },
    ],
    tags: ['networking'],
    deliveryEstimateDays: 5,
    reviews: reviews('network_switch', 4),
  },
  {
    id: 'prod_disinfectant',
    slug: 'clearline-industrial-disinfectant-4gal',
    name: 'ClearLine Industrial Disinfectant Concentrate (4 Gallon)',
    shortDescription: 'EPA-registered concentrate for facility-wide disinfection.',
    description:
      'Hospital-grade disinfectant concentrate effective against a broad spectrum of pathogens. Dilutes up to 1:256, providing significant cost savings for large facility cleaning programs.',
    images: [
      'https://images.unsplash.com/photo-1584744982491-665216d95f8b?q=80&w=1200&auto=format&fit=crop',
    ],
    categoryId: 'cat_cleaning',
    categorySlug: 'cleaning-supplies',
    vendorId: 'vnd_clearline',
    price: 78.0,
    compareAtPrice: 95.0,
    currency: 'USD',
    rating: 4.6,
    reviewCount: 302,
    stock: 260,
    stockStatus: 'in-stock',
    sku: 'CLR-DIS-1102',
    unit: 'container (4 gal)',
    minOrderQty: 1,
    bulkPricing: bulkTiers(78.0),
    specifications: [
      { label: 'Dilution ratio', value: 'Up to 1:256' },
      { label: 'Certification', value: 'EPA registered' },
      { label: 'Kill claims', value: 'Broad-spectrum, 99.9%' },
    ],
    tags: ['facility', 'disinfectant'],
    deliveryEstimateDays: 4,
    reviews: reviews('disinfectant', 4),
  },
  {
    id: 'prod_trash_liners',
    slug: 'clearline-heavy-duty-trash-liners',
    name: 'ClearLine Heavy-Duty Trash Liners (250 Count)',
    shortDescription: 'Puncture-resistant 45-gallon liners for commercial use.',
    description:
      'High-density polyethylene liners rated for heavy commercial use, resistant to punctures and tears. Packed 250 per case for facility-wide standardization.',
    images: [
      'https://images.unsplash.com/photo-1610557892470-55d587e2b53f?q=80&w=1200&auto=format&fit=crop',
    ],
    categoryId: 'cat_cleaning',
    categorySlug: 'cleaning-supplies',
    vendorId: 'vnd_clearline',
    price: 44.5,
    currency: 'USD',
    rating: 4.4,
    reviewCount: 198,
    stock: 520,
    stockStatus: 'in-stock',
    sku: 'CLR-BAG-2210',
    unit: 'case (250 ct)',
    minOrderQty: 2,
    bulkPricing: bulkTiers(44.5),
    specifications: [
      { label: 'Capacity', value: '45 gallon' },
      { label: 'Material', value: 'High-density polyethylene' },
      { label: 'Count', value: '250 liners per case' },
    ],
    tags: ['facility'],
    deliveryEstimateDays: 4,
    reviews: reviews('trash_liners', 3),
  },
  {
    id: 'prod_microfiber',
    slug: 'clearline-microfiber-cloth-pack',
    name: 'ClearLine Commercial Microfiber Cloths (100 Pack)',
    shortDescription: 'Lint-free microfiber cloths for surfaces and electronics.',
    description:
      'Reusable, machine-washable microfiber cloths ideal for surface cleaning, glass, and electronics. Color-coded packs available for cross-contamination control programs.',
    images: [
      'https://images.unsplash.com/photo-1610557892470-55d587e2b53f?q=80&w=1200&auto=format&fit=crop',
    ],
    categoryId: 'cat_cleaning',
    categorySlug: 'cleaning-supplies',
    vendorId: 'vnd_clearline',
    price: 36.0,
    currency: 'USD',
    rating: 4.7,
    reviewCount: 156,
    stock: 700,
    stockStatus: 'in-stock',
    sku: 'CLR-CLO-3305',
    unit: 'pack (100 ct)',
    minOrderQty: 2,
    bulkPricing: bulkTiers(36.0),
    specifications: [
      { label: 'Material', value: '80/20 microfiber blend' },
      { label: 'Reusable', value: 'Machine washable, 300+ cycles' },
      { label: 'Count', value: '100 cloths per pack' },
    ],
    tags: ['facility'],
    isNew: true,
    deliveryEstimateDays: 3,
    reviews: reviews('microfiber', 3),
  },
  {
    id: 'prod_led_panel',
    slug: 'voltedge-led-panel-light-2x4',
    name: 'VoltEdge Commercial LED Panel Light (2x4 ft)',
    shortDescription: 'High-efficiency LED panel for drop-ceiling office lighting.',
    description:
      'Energy-efficient LED panel delivering 5000 lumens with dimmable driver compatibility. Designed for drop-ceiling grids in commercial office environments, DLC listed for utility rebates.',
    images: [
      'https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?q=80&w=1200&auto=format&fit=crop',
    ],
    categoryId: 'cat_electrical',
    categorySlug: 'electrical-products',
    vendorId: 'vnd_voltedge',
    price: 38.0,
    compareAtPrice: 46.0,
    currency: 'USD',
    rating: 4.6,
    reviewCount: 421,
    stock: 980,
    stockStatus: 'in-stock',
    sku: 'VLT-LED-4432',
    unit: 'unit',
    minOrderQty: 4,
    bulkPricing: bulkTiers(38.0),
    specifications: [
      { label: 'Lumens', value: '5000 lm' },
      { label: 'Color temperature', value: '4000K (adjustable 3500K-5000K)' },
      { label: 'Certification', value: 'DLC Premium listed' },
      { label: 'Lifespan', value: '50,000 hours' },
    ],
    tags: ['lighting', 'energy-efficient'],
    isBestSeller: true,
    deliveryEstimateDays: 3,
    reviews: reviews('led_panel', 6),
  },
  {
    id: 'prod_surge_protector',
    slug: 'voltedge-industrial-surge-protector',
    name: 'VoltEdge Industrial Power Distribution Unit',
    shortDescription: 'Rack-mount PDU with surge protection for server rooms.',
    description:
      'Rack-mountable power distribution unit with 24 outlets, surge suppression, and remote monitoring capability for server rooms and data closets.',
    images: [
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1200&auto=format&fit=crop',
    ],
    categoryId: 'cat_electrical',
    categorySlug: 'electrical-products',
    vendorId: 'vnd_voltedge',
    price: 215.0,
    currency: 'USD',
    rating: 4.5,
    reviewCount: 132,
    stock: 75,
    stockStatus: 'low-stock',
    sku: 'VLT-PDU-5590',
    unit: 'unit',
    minOrderQty: 1,
    bulkPricing: bulkTiers(215.0),
    specifications: [
      { label: 'Outlets', value: '24 (NEMA 5-15R)' },
      { label: 'Surge rating', value: '4500 joules' },
      { label: 'Monitoring', value: 'Remote via SNMP/network card' },
      { label: 'Mounting', value: '1U rack-mount' },
    ],
    tags: ['power', 'data-center'],
    deliveryEstimateDays: 5,
    reviews: reviews('surge_protector', 3),
  },
  {
    id: 'prod_wire_spool',
    slug: 'voltedge-thhn-copper-wire-spool',
    name: 'VoltEdge THHN Copper Wire Spool (500ft, 12 AWG)',
    shortDescription: 'Commercial-grade copper wire for facility electrical work.',
    description:
      'THHN-rated stranded copper wire, 12 AWG, in a 500ft spool. Suitable for conduit runs in commercial building electrical installations, UL listed.',
    images: [
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=1200&auto=format&fit=crop',
    ],
    categoryId: 'cat_electrical',
    categorySlug: 'electrical-products',
    vendorId: 'vnd_voltedge',
    price: 129.0,
    currency: 'USD',
    rating: 4.7,
    reviewCount: 187,
    stock: 340,
    stockStatus: 'in-stock',
    sku: 'VLT-WIR-6673',
    unit: 'spool (500 ft)',
    minOrderQty: 1,
    bulkPricing: bulkTiers(129.0),
    specifications: [
      { label: 'Gauge', value: '12 AWG' },
      { label: 'Rating', value: 'THHN, 600V' },
      { label: 'Length', value: '500 ft per spool' },
      { label: 'Certification', value: 'UL listed' },
    ],
    tags: ['electrical'],
    isNew: true,
    deliveryEstimateDays: 5,
    reviews: reviews('wire_spool', 3),
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug);
}

export function getProductsByCategory(categorySlug: string, limit?: number): Product[] {
  const result = products.filter((product) => product.categorySlug === categorySlug);
  return typeof limit === 'number' ? result.slice(0, limit) : result;
}

export function getFeaturedProductsByCategory(categorySlug: string, limit = 8): Product[] {
  return [...getProductsByCategory(categorySlug)]
    .sort((a, b) => b.rating * b.reviewCount - a.rating * a.reviewCount)
    .slice(0, limit);
}

export function getBestSellersByCategory(categorySlug: string, limit = 8): Product[] {
  return getProductsByCategory(categorySlug)
    .filter((product) => product.isBestSeller)
    .slice(0, limit);
}

export function getNewArrivalsByCategory(categorySlug: string, limit = 8): Product[] {
  return getProductsByCategory(categorySlug)
    .filter((product) => product.isNew)
    .slice(0, limit);
}

export function getRecommendedProductsByCategory(categorySlug: string, limit = 8): Product[] {
  return [...getProductsByCategory(categorySlug)]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit);
}

export function getRelatedProducts(product: Product, limit = 4): Product[] {
  return products
    .filter((item) => item.id !== product.id && item.categoryId === product.categoryId)
    .slice(0, limit);
}

export function getFrequentlyBoughtTogether(product: Product, limit = 3): Product[] {
  return products.filter((item) => item.id !== product.id).slice(0, limit);
}

export function getBestSellers(limit = 8): Product[] {
  return products.filter((product) => product.isBestSeller).slice(0, limit);
}

export function getTrendingProducts(limit = 8): Product[] {
  return products.filter((product) => product.isTrending).slice(0, limit);
}

export function getRecommendedProducts(limit = 8): Product[] {
  return [...products].sort((a, b) => b.rating - a.rating).slice(0, limit);
}

export function getFlashDeals(limit = 12): Product[] {
  return products
    .filter((product) => product.compareAtPrice && product.compareAtPrice > product.price)
    .slice(0, limit);
}

export function getJustForYou(limit = 16): Product[] {
  return [...products].sort((a, b) => b.reviewCount - a.reviewCount).slice(0, limit);
}
