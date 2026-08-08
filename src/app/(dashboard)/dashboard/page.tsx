import type { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardStats } from '@/features/dashboard/components/dashboard-stats';

export const metadata: Metadata = {
  title: 'Dashboard',
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Operations overview</h2>
        <p className="text-muted-foreground">
          Secure workspace metrics and activity for your organization.
        </p>
      </div>

      <DashboardStats />

      <Card>
        <CardHeader>
          <CardTitle>Security posture</CardTitle>
          <CardDescription>
            This boilerplate ships with JWT rotation, RBAC, CSP, CSRF, and hardened cookies.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm text-muted-foreground md:grid-cols-2">
          <p>Access tokens expire quickly and refresh tokens are rotated on every use.</p>
          <p>Route middleware enforces authentication and permission checks before render.</p>
          <p>API handlers validate input with Zod and sanitize free-text fields.</p>
          <p>Errors never expose stack traces or secrets to clients in production.</p>
        </CardContent>
      </Card>
    </div>
  );
}
