import { cache } from 'react';
import { prisma } from '@/lib/prisma';
import { serializeCategory, serializeProduct, serializeVendor } from '@/lib/catalog/catalog-mapper';
import type { Category, Product, Vendor } from '@/types/catalog';

const PRODUCT_INCLUDE = {
  category: true,
  bulkPricing: true,
  specifications: true,
  reviews: true,
} as const;

/**
 * Server-side catalog reads, deduped per request via React's `cache()` so
 * pages that call several of the selectors below only hit the DB once each.
 */
export const getCategories = cache(async (): Promise<Category[]> => {
  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
  return categories.map(serializeCategory);
});

export const getVendors = cache(async (): Promise<Vendor[]> => {
  const vendors = await prisma.vendor.findMany({
    include: { categories: true },
    orderBy: { name: 'asc' },
  });
  return vendors.map(serializeVendor);
});

export const getProducts = cache(async (): Promise<Product[]> => {
  const products = await prisma.product.findMany({
    include: PRODUCT_INCLUDE,
    orderBy: { createdAt: 'desc' },
  });
  return products.map(serializeProduct);
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
  const products = await getProducts();
  return products.find((product) => product.slug === slug);
}

export async function getProductsByCategory(
  categorySlug: string,
  limit?: number,
): Promise<Product[]> {
  const products = await getProducts();
  const result = products.filter((product) => product.categorySlug === categorySlug);
  return typeof limit === 'number' ? result.slice(0, limit) : result;
}

export async function getFeaturedProductsByCategory(
  categorySlug: string,
  limit = 8,
): Promise<Product[]> {
  const products = await getProductsByCategory(categorySlug);
  return [...products]
    .sort((a, b) => b.rating * b.reviewCount - a.rating * a.reviewCount)
    .slice(0, limit);
}

export async function getBestSellersByCategory(
  categorySlug: string,
  limit = 8,
): Promise<Product[]> {
  const products = await getProductsByCategory(categorySlug);
  return products.filter((product) => product.isBestSeller).slice(0, limit);
}

export async function getNewArrivalsByCategory(
  categorySlug: string,
  limit = 8,
): Promise<Product[]> {
  const products = await getProductsByCategory(categorySlug);
  return products.filter((product) => product.isNew).slice(0, limit);
}

export async function getRecommendedProductsByCategory(
  categorySlug: string,
  limit = 8,
): Promise<Product[]> {
  const products = await getProductsByCategory(categorySlug);
  return [...products].sort((a, b) => b.rating - a.rating).slice(0, limit);
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  const products = await getProducts();
  return products
    .filter((item) => item.id !== product.id && item.categoryId === product.categoryId)
    .slice(0, limit);
}

export async function getFrequentlyBoughtTogether(product: Product, limit = 3): Promise<Product[]> {
  const products = await getProducts();
  return products.filter((item) => item.id !== product.id).slice(0, limit);
}

export async function getBestSellers(limit = 8): Promise<Product[]> {
  const products = await getProducts();
  return products.filter((product) => product.isBestSeller).slice(0, limit);
}

export async function getTrendingProducts(limit = 8): Promise<Product[]> {
  const products = await getProducts();
  return products.filter((product) => product.isTrending).slice(0, limit);
}

export async function getRecommendedProducts(limit = 8): Promise<Product[]> {
  const products = await getProducts();
  return [...products].sort((a, b) => b.rating - a.rating).slice(0, limit);
}
