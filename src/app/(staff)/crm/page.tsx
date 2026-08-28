import type { Metadata } from 'next';
import { Bell, Clock, MessagesSquare, Users } from 'lucide-react';
import { KpiCard } from '@/components/shared/kpi-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge, type BadgeProps } from '@/components/ui/badge';
import { ChatPanel } from '@/features/crm/chat-panel';
import { supportTickets } from '@/lib/mock-data';
import { formatDateTime } from '@/lib/utils';

export const metadata: Metadata = { title: 'CRM & Communication' };

const priorityVariant: Record<string, BadgeProps['variant']> = {
  low: 'secondary',
  medium: 'info',
  high: 'warning',
  urgent: 'destructive',
};

const statusVariant: Record<string, BadgeProps['variant']> = {
  open: 'warning',
  pending: 'info',
  resolved: 'success',
};

const notifications = [
  { id: 'n1', title: 'Invoice INV-29988 is now overdue', time: '2 hours ago' },
  { id: 'n2', title: 'New RFQ submitted: Server Room Networking Gear', time: '5 hours ago' },
  { id: 'n3', title: 'Delivery GO-2026-07602 delayed — customer notified', time: '1 day ago' },
  { id: 'n4', title: 'Vendor TechNova Distribution updated catalog pricing', time: '2 days ago' },
];

export default function CrmPage() {
  const openCount = supportTickets.filter((t) => t.status === 'open').length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">CRM & communication</h2>
        <p className="text-muted-foreground">
          Customer relationships, support tickets, and team collaboration.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Open tickets"
          value={openCount.toString()}
          icon={MessagesSquare}
          iconTone="warning"
        />
        <KpiCard
          label="Avg. response time"
          value="18 min"
          delta={-22}
          icon={Clock}
          iconTone="success"
        />
        <KpiCard
          label="Active customers"
          value="48,214"
          delta={5.6}
          icon={Users}
          iconTone="primary"
        />
        <KpiCard
          label="Unread notifications"
          value={notifications.length.toString()}
          icon={Bell}
          iconTone="info"
        />
      </div>

      <Tabs defaultValue="tickets">
        <TabsList>
          <TabsTrigger value="tickets">Support tickets</TabsTrigger>
          <TabsTrigger value="live-chat">Live chat</TabsTrigger>
          <TabsTrigger value="team-chat">Internal team chat</TabsTrigger>
          <TabsTrigger value="notifications">Notification center</TabsTrigger>
        </TabsList>

        <TabsContent value="tickets">
          <Card>
            <CardContent className="overflow-x-auto pt-6">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="text-muted-foreground text-left text-xs tracking-wide uppercase">
                  <tr className="border-b">
                    <th className="py-2.5 pr-4 font-medium">Subject</th>
                    <th className="py-2.5 pr-4 font-medium">Customer</th>
                    <th className="py-2.5 pr-4 font-medium">Priority</th>
                    <th className="py-2.5 pr-4 font-medium">Status</th>
                    <th className="py-2.5 pr-4 font-medium">Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {supportTickets.map((ticket) => (
                    <tr key={ticket.id} className="border-b last:border-0">
                      <td className="py-3 pr-4 font-medium">{ticket.subject}</td>
                      <td className="text-muted-foreground py-3 pr-4">{ticket.customer}</td>
                      <td className="py-3 pr-4">
                        <Badge variant={priorityVariant[ticket.priority]}>{ticket.priority}</Badge>
                      </td>
                      <td className="py-3 pr-4">
                        <Badge variant={statusVariant[ticket.status]}>{ticket.status}</Badge>
                      </td>
                      <td className="text-muted-foreground py-3 pr-4">
                        {formatDateTime(ticket.updatedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="live-chat">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Customer conversation — Aisha Rahman</CardTitle>
            </CardHeader>
            <CardContent>
              <ChatPanel variant="customer" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team-chat">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">#operations-team</CardTitle>
            </CardHeader>
            <CardContent>
              <ChatPanel variant="team" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardContent className="divide-y pt-6">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <span className="bg-primary/10 text-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
                    <Bell className="h-4 w-4" />
                  </span>
                  <div className="flex-1">
                    <p className="text-sm">{notification.title}</p>
                    <p className="text-muted-foreground text-xs">{notification.time}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
