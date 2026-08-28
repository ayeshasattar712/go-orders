'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader } from '@/components/ui/loader';
import { useCustomerAuthStore } from '@/store/customer-auth-store';
import { useCurrentCustomer } from '@/services/queries';

export function ProfileCard() {
  const storedUser = useCustomerAuthStore((state) => state.user);
  const { data, isLoading } = useCurrentCustomer(Boolean(storedUser));
  const user = data ?? storedUser;

  if (isLoading && !user) return <Loader />;
  if (!user) return <p className="text-muted-foreground text-sm">No profile loaded.</p>;

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>
          {user.firstName} {user.lastName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p>
          <span className="text-muted-foreground">Email:</span> {user.email}
        </p>
        <p>
          <span className="text-muted-foreground">Role:</span> {user.role}
        </p>
        <div>
          <p className="text-muted-foreground mb-2">Permissions</p>
          <div className="flex flex-wrap gap-2">
            {user.permissions.map((permission) => (
              <span key={permission} className="bg-muted rounded-md border px-2 py-1 text-xs">
                {permission}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
