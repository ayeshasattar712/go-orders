'use client';

import { useState } from 'react';
import { Ban, Plus, Trash2, Unlock } from 'lucide-react';
import { ROLES, type Role } from '@/constants/roles';
import { useCreateStaff, useDeleteStaff, useUpdateStaff, useUsers } from '@/services/queries';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Modal } from '@/components/ui/modal';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { User } from '@/types/auth';
import type { CreateStaffInput } from '@/schemas/user.schema';

const STAFF_ROLES: Role[] = [
  ROLES.SUPER_ADMIN,
  ROLES.ADMIN,
  ROLES.FINANCE_MANAGER,
  ROLES.PROCUREMENT_MANAGER,
  ROLES.INVENTORY_MANAGER,
  ROLES.SALES_MANAGER,
  ROLES.MANAGER,
  ROLES.VIEWER,
];

const emptyForm: CreateStaffInput = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  role: ROLES.ADMIN,
};

export function UsersTable() {
  const { data = [], isLoading, isError, error } = useUsers();
  const createStaff = useCreateStaff();
  const updateStaff = useUpdateStaff();
  const deleteStaff = useDeleteStaff();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CreateStaffInput>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);

  const columns: DataTableColumn<User>[] = [
    {
      key: 'name',
      header: 'Name',
      cell: (row) => `${row.firstName} ${row.lastName}`,
    },
    { key: 'email', header: 'Email' },
    { key: 'role', header: 'Role' },
    {
      key: 'isActive',
      header: 'Status',
      cell: (row) => (row.isActive ? 'Active' : 'Suspended'),
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (row) => (
        <div className="flex flex-wrap gap-1.5">
          {row.isActive ? (
            <Button
              size="sm"
              variant="outline"
              disabled={updateStaff.isPending}
              onClick={() => updateStaff.mutate({ id: row.id, payload: { isActive: false } })}
            >
              <Ban className="h-3.5 w-3.5" /> Suspend
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              disabled={updateStaff.isPending}
              onClick={() => updateStaff.mutate({ id: row.id, payload: { isActive: true } })}
            >
              <Unlock className="h-3.5 w-3.5" /> Reactivate
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            disabled={deleteStaff.isPending}
            onClick={() => {
              if (window.confirm(`Delete staff account ${row.email}?`)) {
                deleteStaff.mutate(row.id);
              }
            }}
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </Button>
        </div>
      ),
    },
  ];

  async function handleCreate() {
    setFormError(null);
    try {
      await createStaff.mutateAsync(form);
      setForm(emptyForm);
      setOpen(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Unable to create staff account');
    }
  }

  if (isError) {
    return (
      <p className="text-destructive text-sm">
        {error instanceof Error ? error.message : 'Failed to load users'}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> Register staff
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        emptyTitle="No staff users found"
        emptyDescription="Register staff accounts here. There is no public admin signup."
      />

      <Modal
        open={open}
        onOpenChange={setOpen}
        title="Register staff account"
        description="Only Super Admin / Admin with users:write can create staff. Customers sign up on port 3000."
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={createStaff.isPending}>
              {createStaff.isPending ? 'Creating...' : 'Create account'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>First name</Label>
              <Input
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Last name</Label>
              <Input
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Temporary password</Label>
            <Input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Select
              value={form.role}
              onValueChange={(value) =>
                setForm({ ...form, role: value as CreateStaffInput['role'] })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STAFF_ROLES.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {formError ? <p className="text-destructive text-sm">{formError}</p> : null}
        </div>
      </Modal>
    </div>
  );
}
