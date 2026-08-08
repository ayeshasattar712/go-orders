'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader } from '@/components/ui/loader';
import { useAuthStore } from '@/store/auth-store';
import { useCurrentUser } from '@/services/queries';

export function ProfileCard() {
  const storedUser = useAuthStore((state) => state.user);
  const { data, isLoading } = useCurrentUser(Boolean(storedUser));
  const user = data ?? storedUser;

  if (isLoading && !user) return <Loader />;
  if (!user) return <p className="text-sm text-muted-foreground">No profile loaded.</p>;

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
          <p className="mb-2 text-muted-foreground">Permissions</p>
          <div className="flex flex-wrap gap-2">
            {user.permissions.map((permission) => (
              <span key={permission} className="rounded-md border bg-muted px-2 py-1 text-xs">
                {permission}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
