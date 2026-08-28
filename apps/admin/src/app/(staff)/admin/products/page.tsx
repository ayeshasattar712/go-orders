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
import { Loader } from '@/components/ui/loader';
import { EmptyState } from '@/components/ui/empty-state';
import {
  useCategories,
  useVendors,
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from '@/services/queries';
import type { CreateProductInput } from '@/schemas/product.schema';
import { ImagePicker } from '@/components/catalog/image-picker';
import { imagesForCategory } from '@/lib/catalog/category-images';
import { formatCurrency } from '@/lib/utils';
import type { Product } from '@/types/catalog';

const STOCK_STATUSES: Product['stockStatus'][] = [
  'in-stock',
  'low-stock',
  'out-of-stock',
  'preorder',
];

function emptyForm(categoryId: string, vendorId: string): CreateProductInput {
  return {
    name: '',
    shortDescription: '',
    description: '',
    images: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=800&auto=format&fit=crop',
    ],
    categoryId,
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
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: categories = [] } = useCategories();
  const { data: vendors = [] } = useVendors();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [form, setForm] = useState<CreateProductInput>(() => emptyForm('', ''));
  const [tagsInput, setTagsInput] = useState('');
  const [specsInput, setSpecsInput] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [listError, setListError] = useState<string | null>(null);

  const filteredProducts = useMemo(
    () =>
      filterCategory === 'all' ? products : products.filter((p) => p.categoryId === filterCategory),
    [products, filterCategory],
  );

  function openCreate() {
    setEditing(null);
    setForm(emptyForm(categories[0]?.id ?? '', vendors[0]?.id ?? ''));
    setTagsInput('');
    setSpecsInput('');
    setFormError(null);
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
    });
    setTagsInput(product.tags.join(', '));
    setSpecsInput(product.specifications.map((s) => `${s.label}: ${s.value}`).join('\n'));
    setFormError(null);
    setOpen(true);
  }

  async function handleSave() {
    if (!form.name.trim() || !form.categoryId || !form.vendorId) return;
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    const specifications = specsInput
      .split('\n')
      .map((line) => line.split(':'))
      .filter(([label, value]) => label && value)
      .map(([label, ...rest]) => ({ label: (label ?? '').trim(), value: rest.join(':').trim() }));

    const payload: CreateProductInput = { ...form, tags, specifications };
    setFormError(null);
    try {
      if (editing) {
        await updateProduct.mutateAsync({ id: editing.id, ...payload });
      } else {
        await createProduct.mutateAsync(payload);
      }
      setOpen(false);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Unable to save product');
    }
  }

  function handleDelete(product: Product) {
    setListError(null);
    deleteProduct.mutate(product.id, {
      onError: (error) =>
        setListError(error instanceof Error ? error.message : 'Unable to delete product'),
    });
  }

  const isSaving = createProduct.isPending || updateProduct.isPending;
  const selectedCategory = categories.find((category) => category.id === form.categoryId);
  const categoryImageOptions = [
    ...(selectedCategory?.image
      ? [{ label: `${selectedCategory.name} cover`, url: selectedCategory.image }]
      : []),
    ...imagesForCategory(selectedCategory?.name ?? selectedCategory?.slug ?? ''),
  ].filter((option, index, list) => list.findIndex((item) => item.url === option.url) === index);

  if (productsLoading) {
    return <Loader label="Loading products..." />;
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

      {listError ? (
        <p className="border-destructive/30 bg-destructive/5 text-destructive rounded-lg border p-3 text-sm">
          {listError}
        </p>
      ) : null}

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
          {filteredProducts.length === 0 ? (
            <EmptyState
              title="No products yet"
              description="Create your first product to see it here."
            />
          ) : (
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
                    const isDeleting =
                      deleteProduct.isPending && deleteProduct.variables === product.id;
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
                              onClick={() => handleDelete(product)}
                              disabled={isDeleting}
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
          )}
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
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : editing ? 'Save changes' : 'Create product'}
            </Button>
          </>
        }
      >
        <div className="max-h-[65vh] space-y-4 overflow-y-auto pr-1">
          {formError ? (
            <p className="border-destructive/30 bg-destructive/5 text-destructive rounded-lg border p-3 text-sm">
              {formError}
            </p>
          ) : null}
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
                onValueChange={(value) => {
                  const category = categories.find((item) => item.id === value);
                  const nextImages = imagesForCategory(category?.name ?? '');
                  setForm({
                    ...form,
                    categoryId: value,
                    images: [category?.image || nextImages[0]?.url || form.images[0] || ''],
                  });
                }}
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
            <Label>Product image for this category</Label>
            <ImagePicker
              options={categoryImageOptions}
              value={form.images[0] ?? ''}
              onChange={(url) => setForm({ ...form, images: [url] })}
            />
            <Input
              value={form.images[0] ?? ''}
              onChange={(e) => setForm({ ...form, images: [e.target.value] })}
              placeholder="Or paste an image URL"
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
