import type {
  Category as PrismaCategory,
  CategoryStatus as PrismaCategoryStatus,
  Vendor as PrismaVendor,
  VendorStatus as PrismaVendorStatus,
  Product as PrismaProduct,
  StockStatus as PrismaStockStatus,
  BulkPriceTier as PrismaBulkPriceTier,
  ProductSpecification as PrismaProductSpecification,
  ProductReview as PrismaProductReview,
} from '@prisma/client';
import type { Category, Vendor, Product, CategoryStatus, VendorStatus } from '@/types/catalog';

export const CATEGORY_STATUS_TO_STRING: Record<PrismaCategoryStatus, CategoryStatus> = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
};

export const CATEGORY_STATUS_FROM_STRING: Record<CategoryStatus, PrismaCategoryStatus> = {
  active: 'ACTIVE',
  inactive: 'INACTIVE',
};

export const VENDOR_STATUS_TO_STRING: Record<PrismaVendorStatus, VendorStatus> = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  SUSPENDED: 'suspended',
};

export const VENDOR_STATUS_FROM_STRING: Record<VendorStatus, PrismaVendorStatus> = {
  pending: 'PENDING',
  approved: 'APPROVED',
  rejected: 'REJECTED',
  suspended: 'SUSPENDED',
};

export const STOCK_STATUS_TO_STRING: Record<PrismaStockStatus, Product['stockStatus']> = {
  IN_STOCK: 'in-stock',
  LOW_STOCK: 'low-stock',
  OUT_OF_STOCK: 'out-of-stock',
  PREORDER: 'preorder',
};

export const STOCK_STATUS_FROM_STRING: Record<Product['stockStatus'], PrismaStockStatus> = {
  'in-stock': 'IN_STOCK',
  'low-stock': 'LOW_STOCK',
  'out-of-stock': 'OUT_OF_STOCK',
  preorder: 'PREORDER',
};

export function serializeCategory(category: PrismaCategory): Category {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    icon: category.icon,
    productCount: category.productCount,
    image: category.image,
    description: category.description,
    status: CATEGORY_STATUS_TO_STRING[category.status],
  };
}

type PrismaVendorWithCategories = PrismaVendor & { categories: PrismaCategory[] };

export function serializeVendor(vendor: PrismaVendorWithCategories): Vendor {
  return {
    id: vendor.id,
    name: vendor.name,
    slug: vendor.slug,
    logo: vendor.logo,
    banner: vendor.banner,
    rating: vendor.rating,
    reviewCount: vendor.reviewCount,
    verified: vendor.verified,
    location: vendor.location,
    responseTime: vendor.responseTime,
    yearsActive: vendor.yearsActive,
    fulfillmentRate: vendor.fulfillmentRate,
    certifications: vendor.certifications,
    categories: vendor.categories.map((category) => category.id),
    status: VENDOR_STATUS_TO_STRING[vendor.status],
    contactPerson: vendor.contactPerson,
    email: vendor.email,
    phone: vendor.phone,
    address: vendor.address,
    registeredAt: vendor.registeredAt.toISOString(),
    performanceScore: vendor.performanceScore,
  };
}

type PrismaProductWithRelations = PrismaProduct & {
  category: PrismaCategory;
  bulkPricing: PrismaBulkPriceTier[];
  specifications: PrismaProductSpecification[];
  reviews: PrismaProductReview[];
};

export function serializeProduct(product: PrismaProductWithRelations): Product {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    shortDescription: product.shortDescription,
    description: product.description,
    images: product.images,
    categoryId: product.categoryId,
    categorySlug: product.category.slug,
    vendorId: product.vendorId,
    price: product.price,
    compareAtPrice: product.compareAtPrice ?? undefined,
    currency: product.currency,
    rating: product.rating,
    reviewCount: product.reviewCount,
    stock: product.stock,
    stockStatus: STOCK_STATUS_TO_STRING[product.stockStatus],
    sku: product.sku,
    unit: product.unit,
    minOrderQty: product.minOrderQty,
    bulkPricing: product.bulkPricing.map((tier) => ({
      minQty: tier.minQty,
      maxQty: tier.maxQty,
      price: tier.price,
    })),
    specifications: product.specifications.map((spec) => ({
      label: spec.label,
      value: spec.value,
    })),
    tags: product.tags,
    isBestSeller: product.isBestSeller,
    isTrending: product.isTrending,
    isNew: product.isNew,
    deliveryEstimateDays: product.deliveryEstimateDays,
    reviews: product.reviews.map((review) => ({
      id: review.id,
      author: review.author,
      avatar: review.avatar ?? undefined,
      rating: review.rating,
      date: review.date.toISOString(),
      title: review.title,
      body: review.body,
      verified: review.verified,
      helpful: review.helpful,
    })),
  };
}
