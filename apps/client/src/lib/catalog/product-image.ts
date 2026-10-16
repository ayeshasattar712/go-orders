const CLEANING = [
  'https://images.unsplash.com/photo-1563453392212-326f5e854473?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1583947215259-38e31be8751f?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1628177142898-93e36e4e3a71?q=80&w=1200&auto=format&fit=crop',
];

const FURNITURE = [
  'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=1200&auto=format&fit=crop',
];

const GROCERY = [
  'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1578916171728-46686eac8d58?q=80&w=1200&auto=format&fit=crop',
];

const OFFICE = [
  'https://images.unsplash.com/photo-1583225214464-9296029427aa?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1456327102063-fb5054efe647?q=80&w=1200&auto=format&fit=crop',
];

const IT = [
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=1200&auto=format&fit=crop',
];

const ELECTRICAL = [
  'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1507473882602-a56c78b5b0b0?q=80&w=1200&auto=format&fit=crop',
];

const DEFAULT_IMAGE = CLEANING[0]!;

const BY_CATEGORY: Record<string, string[]> = {
  'cleaning-supplies': CLEANING,
  'office-furniture': FURNITURE,
  'grocery-pantry': GROCERY,
  'office-supplies': OFFICE,
  'it-equipment': IT,
  'electrical-products': ELECTRICAL,
};

function poolFor(categorySlug?: string): string[] {
  return BY_CATEGORY[categorySlug ?? ''] ?? CLEANING;
}

export function productImageFallback(categorySlug?: string): string {
  return poolFor(categorySlug)[0] ?? DEFAULT_IMAGE;
}

export function productImageSrc(product: {
  images?: string[];
  categorySlug?: string;
  id?: string;
}): string {
  const first = product.images?.find((src) => src.trim().length > 0);
  if (first) return first;

  const pool = poolFor(product.categorySlug);
  const index = Math.abs(hashId(product.id ?? product.categorySlug ?? 'product')) % pool.length;
  return pool[index] ?? DEFAULT_IMAGE;
}

function hashId(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return hash;
}
