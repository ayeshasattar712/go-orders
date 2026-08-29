'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const departments = ['Facilities', 'IT', 'Operations', 'Warehouse', 'Finance', 'HR'] as const;
const categories = [
  'Office Furniture',
  'IT Equipment',
  'Office Supplies',
  'Grocery & Pantry',
  'Cleaning Supplies',
  'Electrical Products',
] as const;

export type RequirementForm = {
  title: string;
  requestedBy: string;
  department: string;
  category: string;
  quantity: number;
  estimatedValue: number;
};

export function emptyRequirementForm(requestedBy: string): RequirementForm {
  return {
    title: '',
    requestedBy,
    department: departments[0],
    category: categories[0],
    quantity: 1,
    estimatedValue: 1000,
  };
}

type NewRequirementFormProps = {
  form: RequirementForm;
  formError: string | null;
  isSaving: boolean;
  onChange: (form: RequirementForm) => void;
  onCancel: () => void;
  onSubmit: () => void;
};

export function NewRequirementForm({
  form,
  formError,
  isSaving,
  onChange,
  onCancel,
  onSubmit,
}: NewRequirementFormProps) {
  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      {formError ? (
        <p className="border-destructive/30 bg-destructive/5 text-destructive rounded-lg border p-3 text-sm">
          {formError}
        </p>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="requirement-title">Requirement title</Label>
        <Input
          id="requirement-title"
          value={form.title}
          placeholder="e.g. Q4 laptop refresh for sales team"
          onChange={(e) => onChange({ ...form, title: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="requirement-requester">Requested by</Label>
        <Input
          id="requirement-requester"
          value={form.requestedBy}
          onChange={(e) => onChange({ ...form, requestedBy: e.target.value })}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Department</Label>
          <Select
            value={form.department}
            onValueChange={(value) => onChange({ ...form, department: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {departments.map((department) => (
                <SelectItem key={department} value={department}>
                  {department}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Category</Label>
          <Select
            value={form.category}
            onValueChange={(value) => onChange({ ...form, category: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="requirement-quantity">Quantity</Label>
          <Input
            id="requirement-quantity"
            type="number"
            min={1}
            step={1}
            value={form.quantity}
            onChange={(e) => onChange({ ...form, quantity: Number(e.target.value) || 1 })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="requirement-value">Estimated value (PKR)</Label>
          <Input
            id="requirement-value"
            type="number"
            min={1}
            step="0.01"
            value={form.estimatedValue}
            onChange={(e) => onChange({ ...form, estimatedValue: Number(e.target.value) || 0 })}
          />
        </div>
      </div>

      <div className="flex flex-wrap justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSaving || !form.title.trim()}>
          {isSaving ? 'Saving...' : 'Create request'}
        </Button>
      </div>
    </form>
  );
}
