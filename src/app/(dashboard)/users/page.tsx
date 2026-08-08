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
          Role-gated directory of users. Requires <code>users:read</code>.
        </p>
      </div>
      <UsersTable />
    </div>
  );
}
