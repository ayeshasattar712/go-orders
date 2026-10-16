import { cache } from 'react';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { serializeCategory, serializeProduct, serializeVendor } from '@/lib/catalog/catalog-mapper';
import { productImageSrc } from '@/lib/catalog/product-image';
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
  if (images?.length) return { ...product, images };
  if (product.images.some((src) => src.trim().length > 0)) return product;
  return { ...product, images: [productImageSrc(product)] };
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

let databaseUnavailable = false;

function markDatabaseUnavailable(error: unknown) {
  databaseUnavailable = true;
  console.warn(
    '[catalog] Database unavailable — using mock catalog fallback.',
    error instanceof Error ? error.message : error,
  );
}

/** Rough mock filtering when Supabase/Postgres is down so pages still render. */
function mockFindProducts(args: { where?: Prisma.ProductWhereInput; take: number }): Product[] {
  let rows = [...mockProducts];
  const where = args.where;

  if (where && typeof where === 'object') {
    if (where.isBestSeller === true) rows = rows.filter((p) => p.isBestSeller);
    if (where.isTrending === true) rows = rows.filter((p) => p.isTrending);
    if (where.isNew === true) rows = rows.filter((p) => p.isNew);
    if (
      where.compareAtPrice &&
      typeof where.compareAtPrice === 'object' &&
      'not' in where.compareAtPrice
    ) {
      rows = rows.filter((p) => p.compareAtPrice != null);
    }

    const category = where.category;
    if (
      category &&
      typeof category === 'object' &&
      'slug' in category &&
      typeof category.slug === 'string'
    ) {
      rows = rows.filter((p) => p.categorySlug === category.slug);
    }
    if (typeof where.categoryId === 'string') {
      rows = rows.filter((p) => p.categoryId === where.categoryId);
    }

    const not = where.NOT;
    if (not && typeof not === 'object' && !Array.isArray(not) && 'id' in not) {
      const excluded = not.id;
      if (typeof excluded === 'string') rows = rows.filter((p) => p.id !== excluded);
      if (
        excluded &&
        typeof excluded === 'object' &&
        'in' in excluded &&
        Array.isArray(excluded.in)
      ) {
        const ids = new Set(excluded.in.filter((id): id is string => typeof id === 'string'));
        rows = rows.filter((p) => !ids.has(p.id));
      }
    }

    if (
      where.id &&
      typeof where.id === 'object' &&
      'notIn' in where.id &&
      Array.isArray(where.id.notIn)
    ) {
      const ids = new Set(where.id.notIn.filter((id): id is string => typeof id === 'string'));
      rows = rows.filter((p) => !ids.has(p.id));
    }
  }

  return rows
    .slice()
    .sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount)
    .slice(0, args.take);
}

async function findProducts(args: {
  where?: Prisma.ProductWhereInput;
  orderBy?: Prisma.ProductOrderByWithRelationInput | Prisma.ProductOrderByWithRelationInput[];
  take: number;
}): Promise<Product[]> {
  if (databaseUnavailable) return mockFindProducts(args);

  try {
    const products = await prisma.product.findMany({
      where: args.where,
      orderBy: args.orderBy ?? { createdAt: 'desc' },
      take: args.take,
      include: PRODUCT_LIST_INCLUDE,
    });
    return mapProducts(products);
  } catch (error) {
    markDatabaseUnavailable(error);
    return mockFindProducts(args);
  }
}

/**
 * Server-side catalog reads, deduped per request via React's `cache()` so
 * pages that call several of the selectors below only hit the DB once each.
 */
export const getCategories = cache(async (): Promise<Category[]> => {
  if (databaseUnavailable) return mockCategories.map(withMockCategoryImage);

  try {
    const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
    return categories.map(serializeCategory).map(withMockCategoryImage);
  } catch (error) {
    markDatabaseUnavailable(error);
    return mockCategories.map(withMockCategoryImage);
  }
});

export const getVendors = cache(async (): Promise<Vendor[]> => {
  if (databaseUnavailable) return [];

  try {
    const vendors = await prisma.vendor.findMany({
      include: { categories: true },
      orderBy: { name: 'asc' },
    });
    return vendors.map(serializeVendor);
  } catch (error) {
    markDatabaseUnavailable(error);
    return [];
  }
});

/** Full catalog (list include). Prefer limited helpers on home/rails. */
export const getProducts = cache(async (): Promise<Product[]> => {
  if (databaseUnavailable) return mockFindProducts({ take: mockProducts.length });

  try {
    const products = await prisma.product.findMany({
      include: PRODUCT_LIST_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
    return mapProducts(products);
  } catch (error) {
    markDatabaseUnavailable(error);
    return mockFindProducts({ take: mockProducts.length });
  }
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
  if (databaseUnavailable) {
    return mockProducts.find((product) => product.slug === slug);
  }

  try {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: PRODUCT_DETAIL_INCLUDE,
    });
    return product
      ? withMockProductAttributes(withMockProductImages(serializeProduct(product)))
      : undefined;
  } catch (error) {
    markDatabaseUnavailable(error);
    return mockProducts.find((product) => product.slug === slug);
  }
}

export async function getProductsByCategory(
  categorySlug: string,
  limit?: number,
): Promise<Product[]> {
  return findProducts({
    where: { category: { slug: categorySlug } },
    take: typeof limit === 'number' ? limit : 500,
  });
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
  if (databaseUnavailable) return getRecommendedProducts(limit);

  try {
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
  } catch (error) {
    markDatabaseUnavailable(error);
    return getRecommendedProducts(limit);
  }
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
