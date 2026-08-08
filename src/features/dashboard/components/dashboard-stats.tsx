'use client';

import { Activity, ShieldCheck, Users, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const stats = [
  { title: 'Active users', value: '1,248', icon: Users },
  { title: 'Auth success rate', value: '99.97%', icon: ShieldCheck },
  { title: 'API latency', value: '86ms', icon: Zap },
  { title: 'Audit events', value: '12.4k', icon: Activity },
];

export function DashboardStats() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
