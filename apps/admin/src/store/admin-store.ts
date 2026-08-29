'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Category, Product, Vendor, VendorStatus } from '@/types/catalog';
import type { Invoice, InvoiceStatus } from '@/types/enterprise';
import type { Client, ClientStatus, InvoiceAlertRule } from '@/types/admin';

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export type CategoryInput = Omit<Category, 'id' | 'slug' | 'productCount'> & { slug?: string };
export type ProductInput = Omit<Product, 'id' | 'slug' | 'rating' | 'reviewCount' | 'reviews'> & {
  slug?: string;
};
export type VendorInput = Omit<
  Vendor,
  | 'id'
  | 'slug'
  | 'rating'
  | 'reviewCount'
  | 'verified'
  | 'status'
  | 'registeredAt'
  | 'fulfillmentRate'
  | 'yearsActive'
  | 'performanceScore'
> & { slug?: string };
export type ClientInput = Omit<
  Client,
  | 'id'
  | 'status'
  | 'creditUsed'
  | 'creditFrozen'
  | 'outstandingBalance'
  | 'dueAmount'
  | 'nextDueDate'
  | 'joinedAt'
  | 'orderCount'
  | 'totalSpend'
  | 'addresses'
>;
export type InvoiceInput = Omit<Invoice, 'id' | 'status' | 'amountPaid'>;

interface AdminState {
  categories: Category[];
  products: Product[];
  vendors: Vendor[];
  clients: Client[];
  invoices: Invoice[];
  invoiceAlertRules: InvoiceAlertRule[];

  addCategory: (input: CategoryInput) => void;
  updateCategory: (id: string, input: Partial<CategoryInput>) => void;
  deleteCategory: (id: string) => void;

  addProduct: (input: ProductInput) => void;
  updateProduct: (id: string, input: Partial<ProductInput>) => void;
  deleteProduct: (id: string) => void;

  registerVendor: (input: VendorInput) => void;
  updateVendor: (id: string, input: Partial<VendorInput>) => void;
  setVendorStatus: (id: string, status: VendorStatus) => void;
  deleteVendor: (id: string) => void;

  addClient: (input: ClientInput) => void;
  updateClient: (id: string, input: Partial<Client>) => void;
  setClientStatus: (id: string, status: ClientStatus) => void;
  adjustCreditLimit: (id: string, newLimit: number) => void;
  setCreditFrozen: (id: string, frozen: boolean) => void;

  addInvoice: (input: InvoiceInput) => void;
  updateInvoiceStatus: (id: string, status: InvoiceStatus, amountPaid?: number) => void;
  updateInvoice: (id: string, input: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;

  toggleAlertRule: (id: string) => void;
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      categories: [],
      products: [],
      vendors: [],
      clients: [],
      invoices: [],
      invoiceAlertRules: [],

      addCategory: (input) => {
        const slug = input.slug ? slugify(input.slug) : slugify(input.name);
        set({
          categories: [
            ...get().categories,
            { ...input, id: `cat_${Date.now()}`, slug, productCount: 0 },
          ],
        });
      },
      updateCategory: (id, input) => {
        set({
          categories: get().categories.map((category) =>
            category.id === id
              ? { ...category, ...input, slug: input.slug ? slugify(input.slug) : category.slug }
              : category,
          ),
        });
      },
      deleteCategory: (id) => {
        set({ categories: get().categories.filter((category) => category.id !== id) });
      },

      addProduct: (input) => {
        const slug = input.slug ? slugify(input.slug) : slugify(input.name);
        const product: Product = {
          ...input,
          id: `prd_${Date.now()}`,
          slug,
          rating: 0,
          reviewCount: 0,
          reviews: [],
        };
        set({
          products: [...get().products, product],
          categories: get().categories.map((category) =>
            category.id === input.categoryId
              ? { ...category, productCount: category.productCount + 1 }
              : category,
          ),
        });
      },
      updateProduct: (id, input) => {
        set({
          products: get().products.map((product) =>
            product.id === id
              ? { ...product, ...input, slug: input.slug ? slugify(input.slug) : product.slug }
              : product,
          ),
        });
      },
      deleteProduct: (id) => {
        const product = get().products.find((p) => p.id === id);
        set({
          products: get().products.filter((p) => p.id !== id),
          categories: product
            ? get().categories.map((category) =>
                category.id === product.categoryId
                  ? { ...category, productCount: Math.max(0, category.productCount - 1) }
                  : category,
              )
            : get().categories,
        });
      },

      registerVendor: (input) => {
        const slug = input.slug ? slugify(input.slug) : slugify(input.name);
        const vendor: Vendor = {
          ...input,
          id: `vnd_${Date.now()}`,
          slug,
          rating: 0,
          reviewCount: 0,
          verified: false,
          status: 'pending',
          registeredAt: new Date().toISOString().slice(0, 10),
          fulfillmentRate: 0,
          yearsActive: 0,
          performanceScore: 70,
        };
        set({ vendors: [...get().vendors, vendor] });
      },
      updateVendor: (id, input) => {
        set({
          vendors: get().vendors.map((vendor) =>
            vendor.id === id
              ? { ...vendor, ...input, slug: input.slug ? slugify(input.slug) : vendor.slug }
              : vendor,
          ),
        });
      },
      setVendorStatus: (id, status) => {
        set({
          vendors: get().vendors.map((vendor) =>
            vendor.id === id
              ? { ...vendor, status, verified: status === 'approved' ? true : vendor.verified }
              : vendor,
          ),
        });
      },
      deleteVendor: (id) => {
        set({ vendors: get().vendors.filter((vendor) => vendor.id !== id) });
      },

      addClient: (input) => {
        const client: Client = {
          ...input,
          id: `client_${Date.now()}`,
          status: 'active',
          creditUsed: 0,
          creditFrozen: false,
          creditTerms: input.creditTerms ?? 'net-30',
          outstandingBalance: 0,
          dueAmount: 0,
          nextDueDate: null,
          joinedAt: new Date().toISOString().slice(0, 10),
          orderCount: 0,
          totalSpend: 0,
          addresses: [],
        };
        set({ clients: [...get().clients, client] });
      },
      updateClient: (id, input) => {
        set({
          clients: get().clients.map((client) =>
            client.id === id ? { ...client, ...input } : client,
          ),
        });
      },
      setClientStatus: (id, status) => {
        set({
          clients: get().clients.map((client) =>
            client.id === id ? { ...client, status } : client,
          ),
        });
      },
      adjustCreditLimit: (id, newLimit) => {
        set({
          clients: get().clients.map((client) =>
            client.id === id ? { ...client, creditLimit: Math.max(0, newLimit) } : client,
          ),
        });
      },
      setCreditFrozen: (id, frozen) => {
        set({
          clients: get().clients.map((client) =>
            client.id === id ? { ...client, creditFrozen: frozen } : client,
          ),
        });
      },

      addInvoice: (input) => {
        const invoice: Invoice = {
          ...input,
          id: `inv_${Date.now()}`,
          status: 'draft',
          amountPaid: 0,
        };
        set({ invoices: [...get().invoices, invoice] });
      },
      updateInvoiceStatus: (id, status, amountPaid) => {
        set({
          invoices: get().invoices.map((invoice) =>
            invoice.id === id
              ? {
                  ...invoice,
                  status,
                  amountPaid: amountPaid !== undefined ? amountPaid : invoice.amountPaid,
                }
              : invoice,
          ),
        });
      },
      updateInvoice: (id, input) => {
        set({
          invoices: get().invoices.map((invoice) =>
            invoice.id === id ? { ...invoice, ...input } : invoice,
          ),
        });
      },
      deleteInvoice: (id) => {
        set({ invoices: get().invoices.filter((invoice) => invoice.id !== id) });
      },

      toggleAlertRule: (id) => {
        set({
          invoiceAlertRules: get().invoiceAlertRules.map((rule) =>
            rule.id === id ? { ...rule, enabled: !rule.enabled } : rule,
          ),
        });
      },
    }),
    { name: 'goorder-admin' },
  ),
);
