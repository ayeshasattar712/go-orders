'use client';

import { useMemo, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';
import { useAdminStore, type ProductInput } from '@/store/admin-store';
import { formatCurrency } from '@/lib/utils';
import type { Product } from '@/types/catalog';

const STOCK_STATUSES: Product['stockStatus'][] = [
  'in-stock',
  'low-stock',
  'out-of-stock',
  'preorder',
];

function emptyForm(categoryId: string, categorySlug: string, vendorId: string): ProductInput {
  return {
    name: '',
    shortDescription: '',
    description: '',
    images: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=800&auto=format&fit=crop',
    ],
    categoryId,
    categorySlug,
    vendorId,
    price: 0,
    currency: 'USD',
    stock: 0,
    stockStatus: 'in-stock',
    sku: '',
    unit: 'unit',
    minOrderQty: 1,
    bulkPricing: [],
    specifications: [],
    tags: [],
    deliveryEstimateDays: 5,
  };
}

export default function AdminProductsPage() {
  const products = useAdminStore((state) => state.products);
  const categories = useAdminStore((state) => state.categories);
  const vendors = useAdminStore((state) => state.vendors);
  const addProduct = useAdminStore((state) => state.addProduct);
  const updateProduct = useAdminStore((state) => state.updateProduct);
  const deleteProduct = useAdminStore((state) => state.deleteProduct);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [form, setForm] = useState<ProductInput>(() =>
    emptyForm(categories[0]?.id ?? '', categories[0]?.slug ?? '', vendors[0]?.id ?? ''),
  );
  const [tagsInput, setTagsInput] = useState('');
  const [specsInput, setSpecsInput] = useState('');

  const filteredProducts = useMemo(
    () =>
      filterCategory === 'all' ? products : products.filter((p) => p.categoryId === filterCategory),
    [products, filterCategory],
  );

  function openCreate() {
    setEditing(null);
    setForm(emptyForm(categories[0]?.id ?? '', categories[0]?.slug ?? '', vendors[0]?.id ?? ''));
    setTagsInput('');
    setSpecsInput('');
    setOpen(true);
  }

  function openEdit(product: Product) {
    setEditing(product);
    setForm({
      name: product.name,
      shortDescription: product.shortDescription,
      description: product.description,
      images: product.images,
      categoryId: product.categoryId,
      categorySlug: product.categorySlug,
      vendorId: product.vendorId,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      currency: product.currency,
      stock: product.stock,
      stockStatus: product.stockStatus,
      sku: product.sku,
      unit: product.unit,
      minOrderQty: product.minOrderQty,
      bulkPricing: product.bulkPricing,
      specifications: product.specifications,
      tags: product.tags,
      isBestSeller: product.isBestSeller,
      isTrending: product.isTrending,
      isNew: product.isNew,
      deliveryEstimateDays: product.deliveryEstimateDays,
      slug: product.slug,
    });
    setTagsInput(product.tags.join(', '));
    setSpecsInput(product.specifications.map((s) => `${s.label}: ${s.value}`).join('\n'));
    setOpen(true);
  }

  function handleSave() {
    if (!form.name.trim() || !form.categoryId || !form.vendorId) return;
    const category = categories.find((c) => c.id === form.categoryId);
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    const specifications = specsInput
      .split('\n')
      .map((line) => line.split(':'))
      .filter(([label, value]) => label && value)
      .map(([label, ...rest]) => ({ label: (label ?? '').trim(), value: rest.join(':').trim() }));

    const payload: ProductInput = {
      ...form,
      categorySlug: category?.slug ?? form.categorySlug,
      tags,
      specifications,
    };

    if (editing) {
      updateProduct(editing.id, payload);
    } else {
      addProduct(payload);
    }
    setOpen(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Products</h2>
          <p className="text-muted-foreground">
            Manage the marketplace catalog: pricing, inventory, and vendor assignment.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> New product
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle>All products ({filteredProducts.length})</CardTitle>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-sm">
              <thead className="text-muted-foreground text-left text-xs tracking-wide uppercase">
                <tr className="border-b">
                  <th className="py-2.5 pr-4 font-medium">Product</th>
                  <th className="py-2.5 pr-4 font-medium">SKU</th>
                  <th className="py-2.5 pr-4 font-medium">Category</th>
                  <th className="py-2.5 pr-4 font-medium">Vendor</th>
                  <th className="py-2.5 pr-4 font-medium">Price</th>
                  <th className="py-2.5 pr-4 font-medium">Stock</th>
                  <th className="py-2.5 pr-4 font-medium" />
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => {
                  const category = categories.find((c) => c.id === product.categoryId);
                  const vendor = vendors.find((v) => v.id === product.vendorId);
                  return (
                    <tr key={product.id} className="border-b last:border-0">
                      <td className="max-w-[220px] truncate py-3 pr-4 font-medium">
                        {product.name}
                      </td>
                      <td className="text-muted-foreground py-3 pr-4">{product.sku}</td>
                      <td className="text-muted-foreground py-3 pr-4">{category?.name ?? '—'}</td>
                      <td className="text-muted-foreground py-3 pr-4">{vendor?.name ?? '—'}</td>
                      <td className="py-3 pr-4 font-medium">{formatCurrency(product.price)}</td>
                      <td className="py-3 pr-4">
                        <Badge
                          variant={
                            product.stockStatus === 'out-of-stock'
                              ? 'destructive'
                              : product.stockStatus === 'low-stock'
                                ? 'warning'
                                : 'success'
                          }
                        >
                          {product.stock}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => openEdit(product)}
                            aria-label="Edit product"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => deleteProduct(product.id)}
                            aria-label="Delete product"
                          >
                            <Trash2 className="text-destructive h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Modal
        open={open}
        onOpenChange={setOpen}
        title={editing ? 'Edit product' : 'New product'}
        description="Products are shown across the marketplace, category pages, and search."
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>{editing ? 'Save changes' : 'Create product'}</Button>
          </>
        }
      >
        <div className="max-h-[65vh] space-y-4 overflow-y-auto pr-1">
          <div className="space-y-2">
            <Label>Product name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>SKU</Label>
              <Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Unit</Label>
              <Input
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                placeholder="e.g. unit, case, box"
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={form.categoryId}
                onValueChange={(value) => setForm({ ...form, categoryId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Vendor</Label>
              <Select
                value={form.vendorId}
                onValueChange={(value) => setForm({ ...form, vendorId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select vendor" />
                </SelectTrigger>
                <SelectContent>
                  {vendors.map((vendor) => (
                    <SelectItem key={vendor.id} value={vendor.id}>
                      {vendor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Short description</Label>
            <Input
              value={form.shortDescription}
              onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Full description</Label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="bg-background focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-2"
            />
          </div>
          <div className="space-y-2">
            <Label>Image URL</Label>
            <Input
              value={form.images[0] ?? ''}
              onChange={(e) => setForm({ ...form, images: [e.target.value] })}
              placeholder="https://..."
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Price ($)</Label>
              <Input
                type="number"
                min={0}
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>Compare-at price</Label>
              <Input
                type="number"
                min={0}
                step="0.01"
                value={form.compareAtPrice ?? ''}
                onChange={(e) =>
                  setForm({
                    ...form,
                    compareAtPrice: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Min order qty</Label>
              <Input
                type="number"
                min={1}
                value={form.minOrderQty}
                onChange={(e) => setForm({ ...form, minOrderQty: Number(e.target.value) })}
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Stock quantity</Label>
              <Input
                type="number"
                min={0}
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>Stock status</Label>
              <Select
                value={form.stockStatus}
                onValueChange={(value) =>
                  setForm({ ...form, stockStatus: value as Product['stockStatus'] })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STOCK_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Tags (comma separated)</Label>
            <Input
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="ergonomic, bulk, premium"
            />
          </div>
          <div className="space-y-2">
            <Label>Specifications (one per line, &quot;Label: Value&quot;)</Label>
            <textarea
              value={specsInput}
              onChange={(e) => setSpecsInput(e.target.value)}
              rows={3}
              placeholder="Material: Aluminum&#10;Warranty: 2 years"
              className="bg-background focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-2"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
