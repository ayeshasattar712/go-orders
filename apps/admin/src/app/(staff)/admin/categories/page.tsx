'use client';

import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Modal } from '@/components/ui/modal';
import { Loader } from '@/components/ui/loader';
import { EmptyState } from '@/components/ui/empty-state';
import { CategoryIcon } from '@/components/shared/category-icon';
import { ImagePicker } from '@/components/catalog/image-picker';
import { imagesForCategory } from '@/lib/catalog/category-images';
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '@/services/queries';
import type { CreateCategoryInput } from '@/schemas/category.schema';
import type { Category } from '@/types/catalog';

const ICON_OPTIONS = ['Armchair', 'ShoppingBasket', 'Paperclip', 'Laptop', 'SprayCan', 'Plug'];

const emptyForm: CreateCategoryInput = {
  name: '',
  icon: 'Package',
  image: '',
  description: '',
  status: 'active',
};

export default function AdminCategoriesPage() {
  const { data: categories = [], isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState<CreateCategoryInput>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [listError, setListError] = useState<string | null>(null);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setFormError(null);
    setOpen(true);
  }

  function openEdit(category: Category) {
    setEditing(category);
    setForm({
      name: category.name,
      icon: category.icon,
      image: category.image,
      description: category.description,
      status: category.status,
      slug: category.slug,
    });
    setFormError(null);
    setOpen(true);
  }

  async function handleSave() {
    if (!form.name.trim()) return;
    setFormError(null);
    try {
      if (editing) {
        await updateCategory.mutateAsync({ id: editing.id, ...form });
      } else {
        await createCategory.mutateAsync(form);
      }
      setOpen(false);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Unable to save category');
    }
  }

  function handleDelete(category: Category) {
    setListError(null);
    deleteCategory.mutate(category.id, {
      onError: (error) =>
        setListError(error instanceof Error ? error.message : 'Unable to delete category'),
    });
  }

  const isSaving = createCategory.isPending || updateCategory.isPending;

  if (isLoading) {
    return <Loader label="Loading categories..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Categories</h2>
          <p className="text-muted-foreground">
            Create and manage marketplace categories shown to customers.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> New category
        </Button>
      </div>

      {listError ? (
        <p className="border-destructive/30 bg-destructive/5 text-destructive rounded-lg border p-3 text-sm">
          {listError}
        </p>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>All categories ({categories.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <EmptyState
              title="No categories yet"
              description="Create your first category to see it here."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead className="text-muted-foreground text-left text-xs tracking-wide uppercase">
                  <tr className="border-b">
                    <th className="py-2.5 pr-4 font-medium">Category</th>
                    <th className="py-2.5 pr-4 font-medium">Slug</th>
                    <th className="py-2.5 pr-4 font-medium">Products</th>
                    <th className="py-2.5 pr-4 font-medium">Status</th>
                    <th className="py-2.5 pr-4 font-medium" />
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => {
                    const isDeleting =
                      deleteCategory.isPending && deleteCategory.variables === category.id;
                    return (
                      <tr key={category.id} className="border-b last:border-0">
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2.5">
                            <span className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-lg">
                              <CategoryIcon name={category.icon} className="h-4 w-4" />
                            </span>
                            <span className="font-medium">{category.name}</span>
                          </div>
                        </td>
                        <td className="text-muted-foreground py-3 pr-4">{category.slug}</td>
                        <td className="text-muted-foreground py-3 pr-4">
                          {category.productCount.toLocaleString()}
                        </td>
                        <td className="py-3 pr-4">
                          <Badge variant={category.status === 'active' ? 'success' : 'secondary'}>
                            {category.status === 'active' ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => openEdit(category)}
                              aria-label="Edit category"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleDelete(category)}
                              disabled={isDeleting}
                              aria-label="Delete category"
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
        title={editing ? 'Edit category' : 'New category'}
        description="Categories power marketplace navigation and category landing pages."
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : editing ? 'Save changes' : 'Create category'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {formError ? (
            <p className="border-destructive/30 bg-destructive/5 text-destructive rounded-lg border p-3 text-sm">
              {formError}
            </p>
          ) : null}
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Office Furniture"
            />
          </div>
          <div className="space-y-2">
            <Label>Icon</Label>
            <div className="flex flex-wrap gap-2">
              {ICON_OPTIONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setForm({ ...form, icon })}
                  className={`flex h-10 w-10 items-center justify-center rounded-lg border transition-colors ${
                    form.icon === icon
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'text-muted-foreground'
                  }`}
                  aria-label={icon}
                >
                  <CategoryIcon name={icon} className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Category image</Label>
            <ImagePicker
              options={imagesForCategory(form.name || form.slug || '')}
              value={form.image}
              onChange={(url) => setForm({ ...form, image: url })}
            />
            <Input
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
              placeholder="Or paste an image URL"
            />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">Active</p>
              <p className="text-muted-foreground text-xs">
                Inactive categories are hidden from the marketplace.
              </p>
            </div>
            <Switch
              checked={form.status === 'active'}
              onCheckedChange={(checked) =>
                setForm({ ...form, status: checked ? 'active' : 'inactive' })
              }
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
