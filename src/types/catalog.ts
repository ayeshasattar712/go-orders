export type CategoryStatus = 'active' | 'inactive';

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  productCount: number;
  image: string;
  description: string;
  status: CategoryStatus;
}

export type VendorStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export interface Vendor {
  id: string;
  name: string;
  slug: string;
  logo: string;
  banner: string;
  rating: number;
  reviewCount: number;
  verified: boolean;
  location: string;
  responseTime: string;
  yearsActive: number;
  fulfillmentRate: number;
  certifications: string[];
  categories: string[];
  status: VendorStatus;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  registeredAt: string;
  performanceScore: number;
}

export interface BulkPriceTier {
  minQty: number;
  maxQty: number | null;
  price: number;
}

export interface ProductReview {
  id: string;
  author: string;
  avatar?: string;
  rating: number;
  date: string;
  title: string;
  body: string;
  verified: boolean;
  helpful: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  images: string[];
  categoryId: string;
  categorySlug: string;
  vendorId: string;
  price: number;
  compareAtPrice?: number;
  currency: string;
  rating: number;
  reviewCount: number;
  stock: number;
  stockStatus: 'in-stock' | 'low-stock' | 'out-of-stock' | 'preorder';
  sku: string;
  unit: string;
  minOrderQty: number;
  bulkPricing: BulkPriceTier[];
  specifications: { label: string; value: string }[];
  tags: string[];
  isBestSeller?: boolean;
  isTrending?: boolean;
  isNew?: boolean;
  deliveryEstimateDays: number;
  reviews: ProductReview[];
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  avatar: string;
  quote: string;
  rating: number;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'packed'
  | 'shipped'
  | 'out-for-delivery'
  | 'delivered'
  | 'cancelled';

export interface OrderTimelineStep {
  status: OrderStatus;
  label: string;
  timestamp: string | null;
  description: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: OrderStatus;
  total: number;
  itemCount: number;
  eta: string;
  vendorName: string;
  trackingNumber: string;
  carrier: string;
  items: { name: string; image: string; quantity: number; price: number }[];
  timeline: OrderTimelineStep[];
}
