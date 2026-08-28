'use client';

import Link from 'next/link';
import { Bell, CheckCheck, CreditCard, Receipt, Truck, Wallet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { useNotificationStore } from '@/store/notification-store';
import { cn } from '@/lib/utils';
import type { NotificationType } from '@/types/admin';

const typeConfig: Record<NotificationType, { label: string; icon: typeof Bell; tone: string }> = {
  invoice: { label: 'Invoice', icon: Receipt, tone: 'bg-info/10 text-info' },
  payment: { label: 'Payment', icon: CreditCard, tone: 'bg-success/10 text-success' },
  delivery: { label: 'Delivery', icon: Truck, tone: 'bg-primary/10 text-primary' },
  credit: { label: 'Credit', icon: Wallet, tone: 'bg-warning/10 text-warning' },
};

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function NotificationsPage() {
  const notifications = useNotificationStore((state) => state.notifications);
  const markRead = useNotificationStore((state) => state.markRead);
  const markAllRead = useNotificationStore((state) => state.markAllRead);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const sorted = [...notifications].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Notifications</h2>
          <p className="text-muted-foreground">
            Invoice, payment, delivery, and credit alerts in one place.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={markAllRead} disabled={unreadCount === 0}>
          <CheckCheck className="h-4 w-4" /> Mark all as read
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-4 w-4" /> All alerts
            {unreadCount > 0 ? <Badge variant="brand">{unreadCount} new</Badge> : null}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sorted.length === 0 ? (
            <EmptyState title="No notifications" description="You're all caught up." />
          ) : (
            <div className="space-y-2">
              {sorted.map((notification) => {
                const config = typeConfig[notification.type];
                const Icon = config.icon;
                const itemClassName = cn(
                  'flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-colors hover:border-primary/40',
                  !notification.read && 'border-primary/30 bg-primary/5',
                );
                const inner = (
                  <>
                    <span
                      className={cn(
                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
                        config.tone,
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{notification.title}</p>
                        {!notification.read ? (
                          <span className="bg-primary h-2 w-2 shrink-0 rounded-full" />
                        ) : null}
                      </div>
                      <p className="text-muted-foreground text-sm">{notification.message}</p>
                      <p className="text-muted-foreground mt-1 text-xs">
                        {config.label} · {timeAgo(notification.createdAt)}
                      </p>
                    </div>
                  </>
                );

                return notification.href ? (
                  <Link
                    key={notification.id}
                    href={notification.href}
                    className={itemClassName}
                    onClick={() => markRead(notification.id)}
                  >
                    {inner}
                  </Link>
                ) : (
                  <button
                    key={notification.id}
                    type="button"
                    className={itemClassName}
                    onClick={() => markRead(notification.id)}
                  >
                    {inner}
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
