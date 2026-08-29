import type { Metadata } from 'next';
import { UsersTable } from '@/features/users/components/users-table';

export const metadata: Metadata = {
  title: 'Users',
};

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">User management</h2>
        <p className="text-muted-foreground">
          Create client shop logins with auto-generated email and password, or register staff.
        </p>
      </div>
      <UsersTable />
    </div>
  );
}
