import { cache } from 'react';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { serializeCategory, serializeProduct, serializeVendor } from '@/lib/catalog/catalog-mapper';
import { categories as mockCategories } from '@/lib/mock-data/categories';
import { products as mockProducts, filterProductsBySubcategory } from '@/lib/mock-data/products';
import type { Category, Product, Vendor } from '@/types/catalog';

const mockCategoryImageBySlug = new Map(
  mockCategories.map((category) => [category.slug, category.image]),
);
const mockProductImagesById = new Map(mockProducts.map((product) => [product.id, product.images]));
const mockProductAttributesById = new Map(
  mockProducts.map((product) => [product.id, { color: product.color, material: product.material }]),
);

function withMockCategoryImage(category: Category): Category {
  const image = mockCategoryImageBySlug.get(category.slug);
  return image ? { ...category, image } : category;
}

function withMockProductImages(product: Product): Product {
  const images = mockProductImagesById.get(product.id);
  return images?.length ? { ...product, images } : product;
}

/** DB rows don't store color/material yet — overlay from the matching mock catalog entry by id. */
function withMockProductAttributes(product: Product): Product {
  const attributes = mockProductAttributesById.get(product.id);
  return attributes ? { ...product, ...attributes } : product;
}

/** Detail pages — includes a few recent reviews. */
const PRODUCT_DETAIL_INCLUDE = {
  category: true,
  bulkPricing: true,
  specifications: true,
  reviews: { take: 8, orderBy: { date: 'desc' as const } },
} as const;

/** List / home rails — skip heavy review payloads. */
const PRODUCT_LIST_INCLUDE = {
  category: true,
  bulkPricing: true,
  specifications: { take: 0 },
  reviews: { take: 0 },
} as const;

function mapProducts(rows: Parameters<typeof serializeProduct>[0][]): Product[] {
  return rows.map(serializeProduct).map(withMockProductImages).map(withMockProductAttributes);
}

async function findProducts(args: {
  where?: Prisma.ProductWhereInput;
  orderBy?: Prisma.ProductOrderByWithRelationInput | Prisma.ProductOrderByWithRelationInput[];
  take: number;
}): Promise<Product[]> {
  const products = await prisma.product.findMany({
    where: args.where,
    orderBy: args.orderBy ?? { createdAt: 'desc' },
    take: args.take,
    include: PRODUCT_LIST_INCLUDE,
  });
  return mapProducts(products);
}

/**
 * Server-side catalog reads, deduped per request via React's `cache()` so
 * pages that call several of the selectors below only hit the DB once each.
 */
export const getCategories = cache(async (): Promise<Category[]> => {
  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
  return categories.map(serializeCategory).map(withMockCategoryImage);
});

export const getVendors = cache(async (): Promise<Vendor[]> => {
  const vendors = await prisma.vendor.findMany({
    include: { categories: true },
    orderBy: { name: 'asc' },
  });
  return vendors.map(serializeVendor);
});

/** Full catalog (list include). Prefer limited helpers on home/rails. */
export const getProducts = cache(async (): Promise<Product[]> => {
  const products = await prisma.product.findMany({
    include: PRODUCT_LIST_INCLUDE,
    orderBy: { createdAt: 'desc' },
  });
  return mapProducts(products);
});

export async function getCategoryBySlug(slug: string): Promise<Category | undefined> {
  const categories = await getCategories();
  return categories.find((category) => category.slug === slug);
}

export async function getVendorBySlug(slug: string): Promise<Vendor | undefined> {
  const vendors = await getVendors();
  return vendors.find((vendor) => vendor.slug === slug);
}

export async function getVendorById(id: string): Promise<Vendor | undefined> {
  const vendors = await getVendors();
  return vendors.find((vendor) => vendor.id === id);
}

export async function getVendorsByCategory(categoryId: string): Promise<Vendor[]> {
  const vendors = await getVendors();
  return vendors.filter(
    (vendor) => vendor.categories.includes(categoryId) && vendor.status === 'approved',
  );
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: PRODUCT_DETAIL_INCLUDE,
  });
  return product
    ? withMockProductAttributes(withMockProductImages(serializeProduct(product)))
    : undefined;
}

export async function getProductsByCategory(
  categorySlug: string,
  limit?: number,
): Promise<Product[]> {
  const products = await prisma.product.findMany({
    where: { category: { slug: categorySlug } },
    include: PRODUCT_LIST_INCLUDE,
    orderBy: { createdAt: 'desc' },
    ...(typeof limit === 'number' ? { take: limit } : {}),
  });
  return mapProducts(products);
}

export async function getProductsByCategorySub(
  categorySlug: string,
  sub?: string | null,
): Promise<Product[]> {
  const products = await getProductsByCategory(categorySlug);
  return filterProductsBySubcategory(products, sub);
}

export async function getFeaturedProductsByCategory(
  categorySlug: string,
  limit = 8,
): Promise<Product[]> {
  return findProducts({
    where: { category: { slug: categorySlug } },
    orderBy: [{ rating: 'desc' }, { reviewCount: 'desc' }],
    take: limit,
  });
}

export async function getBestSellersByCategory(
  categorySlug: string,
  limit = 8,
): Promise<Product[]> {
  return findProducts({
    where: { category: { slug: categorySlug }, isBestSeller: true },
    orderBy: { reviewCount: 'desc' },
    take: limit,
  });
}

export async function getNewArrivalsByCategory(
  categorySlug: string,
  limit = 8,
): Promise<Product[]> {
  return findProducts({
    where: { category: { slug: categorySlug }, isNew: true },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

export async function getRecommendedProductsByCategory(
  categorySlug: string,
  limit = 8,
): Promise<Product[]> {
  return findProducts({
    where: { category: { slug: categorySlug } },
    orderBy: { rating: 'desc' },
    take: limit,
  });
}

export async function getRelatedProducts(product: Product, limit = 10): Promise<Product[]> {
  const sameCategory = await findProducts({
    where: { categoryId: product.categoryId, NOT: { id: product.id } },
    orderBy: { rating: 'desc' },
    take: limit,
  });
  if (sameCategory.length >= limit) return sameCategory;

  const more = await findProducts({
    where: { NOT: { id: { in: [product.id, ...sameCategory.map((item) => item.id)] } } },
    orderBy: { rating: 'desc' },
    take: limit - sameCategory.length,
  });
  return [...sameCategory, ...more];
}

export async function getFrequentlyBoughtTogether(product: Product, limit = 3): Promise<Product[]> {
  return findProducts({
    where: { categoryId: product.categoryId, NOT: { id: product.id } },
    orderBy: { reviewCount: 'desc' },
    take: limit,
  });
}

export async function getBestSellers(limit = 8): Promise<Product[]> {
  return findProducts({
    where: { isBestSeller: true },
    orderBy: { reviewCount: 'desc' },
    take: limit,
  });
}

export async function getTrendingProducts(limit = 8): Promise<Product[]> {
  return findProducts({
    where: { isTrending: true },
    orderBy: [{ rating: 'desc' }, { reviewCount: 'desc' }],
    take: limit,
  });
}

export async function getRecommendedProducts(limit = 8): Promise<Product[]> {
  return findProducts({
    orderBy: { rating: 'desc' },
    take: limit,
  });
}

function takeUnique(items: Product[], limit: number): Product[] {
  const seen = new Set<string>();
  const out: Product[] = [];
  for (const item of items) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    out.push(item);
    if (out.length >= limit) break;
  }
  return out;
}

/** Guest merchandising: best sellers, then trending, then most-reviewed. */
export async function getFeaturedProducts(limit = 12): Promise<Product[]> {
  const [bestSellers, trending, rest] = await Promise.all([
    findProducts({
      where: { isBestSeller: true },
      orderBy: { reviewCount: 'desc' },
      take: limit,
    }),
    findProducts({
      where: { isTrending: true, isBestSeller: false },
      orderBy: { rating: 'desc' },
      take: limit,
    }),
    findProducts({
      orderBy: [{ rating: 'desc' }, { reviewCount: 'desc' }],
      take: limit,
    }),
  ]);
  return takeUnique([...bestSellers, ...trending, ...rest], limit);
}

/**
 * Logged-in merchandising: prefer categories the customer already buys,
 * then fill with top-rated catalog items.
 */
export async function getRecommendedProductsForUser(
  userId: string,
  limit = 12,
): Promise<Product[]> {
  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
    take: 12,
    include: { items: { select: { productId: true, name: true } } },
  });

  const purchasedIds = new Set<string>();
  for (const order of orders) {
    for (const item of order.items) {
      if (item.productId) purchasedIds.add(item.productId);
    }
  }

  let boostedCategoryIds: string[] = [];
  if (purchasedIds.size > 0) {
    const purchased = await prisma.product.findMany({
      where: { id: { in: [...purchasedIds] } },
      select: { categoryId: true },
    });
    const counts = new Map<string, number>();
    for (const product of purchased) {
      counts.set(product.categoryId, (counts.get(product.categoryId) ?? 0) + 1);
    }
    boostedCategoryIds = [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([categoryId]) => categoryId);
  }

  const excludeIds = [...purchasedIds];
  const picks: Product[] = [];

  for (const categoryId of boostedCategoryIds) {
    if (picks.length >= limit) break;
    const batch = await findProducts({
      where: {
        categoryId,
        ...(excludeIds.length ? { id: { notIn: excludeIds } } : {}),
      },
      orderBy: [{ rating: 'desc' }, { reviewCount: 'desc' }],
      take: limit - picks.length,
    });
    picks.push(...batch);
    excludeIds.push(...batch.map((item) => item.id));
  }

  if (picks.length < limit) {
    const filler = await findProducts({
      where: excludeIds.length ? { id: { notIn: excludeIds } } : undefined,
      orderBy: [{ rating: 'desc' }, { reviewCount: 'desc' }],
      take: limit - picks.length,
    });
    picks.push(...filler);
  }

  return takeUnique(picks, limit);
}

export async function getCatalogHighlight(
  userId: string | null,
  limit = 12,
): Promise<{ kind: 'featured' | 'recommended'; products: Product[] }> {
  if (userId) {
    const recommended = await getRecommendedProductsForUser(userId, limit);
    if (recommended.length > 0) {
      return { kind: 'recommended', products: recommended };
    }
  }
  return {
    kind: 'featured',
    products: await getFeaturedProducts(limit),
  };
}

export async function getFlashDeals(limit = 12): Promise<Product[]> {
  return findProducts({
    where: { compareAtPrice: { not: null } },
    orderBy: { createdAt: 'desc' },
    take: limit * 3,
  }).then((products) =>
    products
      .filter((product) => product.compareAtPrice && product.compareAtPrice > product.price)
      .slice(0, limit),
  );
}
