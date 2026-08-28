'use client';

import { ArrowLeft, Bell, Mail, MessageSquare, MonitorSmartphone } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useAdminStore } from '@/store/admin-store';
import { invoiceAlertLog } from '@/lib/mock-data/admin';
import { formatDate } from '@/lib/utils';
import type { InvoiceAlertChannel } from '@/types/admin';

const channelIcons: Record<InvoiceAlertChannel, typeof Mail> = {
  dashboard: MonitorSmartphone,
  email: Mail,
  sms: MessageSquare,
};

export default function AdminInvoiceAlertsPage() {
  const rules = useAdminStore((state) => state.invoiceAlertRules);
  const toggleAlertRule = useAdminStore((state) => state.toggleAlertRule);

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/admin/invoices">
          <ArrowLeft className="h-4 w-4" /> Back to invoices
        </Link>
      </Button>

      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Invoice alert management</h2>
        <p className="text-muted-foreground">
          Automated reminders sent to clients and admins as invoices approach their due date.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {rules.map((rule) => (
          <Card key={rule.id}>
            <CardHeader className="flex flex-row items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base">{rule.label}</CardTitle>
                <p className="text-muted-foreground mt-1 text-sm">{rule.description}</p>
              </div>
              <Switch checked={rule.enabled} onCheckedChange={() => toggleAlertRule(rule.id)} />
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-muted-foreground mb-1.5 text-xs font-medium tracking-wide uppercase">
                  Channels
                </p>
                <div className="flex gap-2">
                  {rule.channels.map((channel) => {
                    const Icon = channelIcons[channel];
                    return (
                      <Badge key={channel} variant="secondary" className="gap-1 capitalize">
                        <Icon className="h-3 w-3" /> {channel}
                      </Badge>
                    );
                  })}
                </div>
              </div>
              <div>
                <p className="text-muted-foreground mb-1.5 text-xs font-medium tracking-wide uppercase">
                  Recipients
                </p>
                <div className="flex gap-2">
                  {rule.recipients.map((recipient) => (
                    <Badge key={recipient} variant="outline" className="capitalize">
                      {recipient}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-4 w-4" /> Recent alert activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="text-muted-foreground text-left text-xs tracking-wide uppercase">
                <tr className="border-b">
                  <th className="py-2.5 pr-4 font-medium">Invoice</th>
                  <th className="py-2.5 pr-4 font-medium">Client</th>
                  <th className="py-2.5 pr-4 font-medium">Timing</th>
                  <th className="py-2.5 pr-4 font-medium">Channel</th>
                  <th className="py-2.5 pr-4 font-medium">Recipient</th>
                  <th className="py-2.5 pr-4 font-medium">Sent</th>
                </tr>
              </thead>
              <tbody>
                {invoiceAlertLog.map((log) => (
                  <tr key={log.id} className="border-b last:border-0">
                    <td className="py-3 pr-4 font-medium">{log.invoiceNumber}</td>
                    <td className="text-muted-foreground py-3 pr-4">{log.clientName}</td>
                    <td className="text-muted-foreground py-3 pr-4 capitalize">
                      {log.timing.replace('-', ' ')}
                    </td>
                    <td className="text-muted-foreground py-3 pr-4 capitalize">{log.channel}</td>
                    <td className="text-muted-foreground py-3 pr-4 capitalize">{log.recipient}</td>
                    <td className="text-muted-foreground py-3 pr-4">{formatDate(log.sentAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
