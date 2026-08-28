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
import { CategoryIcon } from '@/components/shared/category-icon';
import { useAdminStore, type CategoryInput } from '@/store/admin-store';
import type { Category } from '@/types/catalog';

const ICON_OPTIONS = ['Armchair', 'ShoppingBasket', 'Paperclip', 'Laptop', 'SprayCan', 'Plug'];

const emptyForm: CategoryInput = {
  name: '',
  icon: 'Package',
  image: '',
  description: '',
  status: 'active',
};

export default function AdminCategoriesPage() {
  const categories = useAdminStore((state) => state.categories);
  const addCategory = useAdminStore((state) => state.addCategory);
  const updateCategory = useAdminStore((state) => state.updateCategory);
  const deleteCategory = useAdminStore((state) => state.deleteCategory);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState<CategoryInput>(emptyForm);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
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
    setOpen(true);
  }

  function handleSave() {
    if (!form.name.trim()) return;
    if (editing) {
      updateCategory(editing.id, form);
    } else {
      addCategory(form);
    }
    setOpen(false);
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

      <Card>
        <CardHeader>
          <CardTitle>All categories ({categories.length})</CardTitle>
        </CardHeader>
        <CardContent>
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
                {categories.map((category) => (
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
                          onClick={() => deleteCategory(category.id)}
                          aria-label="Delete category"
                        >
                          <Trash2 className="text-destructive h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
            <Button onClick={handleSave}>{editing ? 'Save changes' : 'Create category'}</Button>
          </>
        }
      >
        <div className="space-y-4">
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
            <Label>Image URL</Label>
            <Input
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
              placeholder="https://..."
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
