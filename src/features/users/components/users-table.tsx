'use client';

import { useUsers } from '@/services/queries';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import type { User } from '@/types/auth';

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
    cell: (row) => (row.isActive ? 'Active' : 'Inactive'),
  },
];

export function UsersTable() {
  const { data = [], isLoading, isError, error } = useUsers();

  if (isError) {
    return (
      <p className="text-sm text-destructive">
        {error instanceof Error ? error.message : 'Failed to load users'}
      </p>
    );
  }

  return (
    <DataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      emptyTitle="No users found"
      emptyDescription="Invite teammates to collaborate in this workspace."
    />
  );
}
