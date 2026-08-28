'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Ban, Plus, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { useAdminStore, type ClientInput } from '@/store/admin-store';
import { formatCurrency } from '@/lib/utils';

const emptyForm: ClientInput = {
  companyName: '',
  contactName: '',
  email: '',
  phone: '',
  address: '',
  creditLimit: 5000,
};

export default function AdminClientsPage() {
  const clients = useAdminStore((state) => state.clients);
  const addClient = useAdminStore((state) => state.addClient);
  const setClientStatus = useAdminStore((state) => state.setClientStatus);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<ClientInput>(emptyForm);

  function handleCreate() {
    if (!form.companyName.trim() || !form.email.trim()) return;
    addClient(form);
    setForm(emptyForm);
    setOpen(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Clients</h2>
          <p className="text-muted-foreground">
            Manage client accounts, credit limits, and order history.
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> New client
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All clients ({clients.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="text-muted-foreground text-left text-xs tracking-wide uppercase">
                <tr className="border-b">
                  <th className="py-2.5 pr-4 font-medium">Company</th>
                  <th className="py-2.5 pr-4 font-medium">Contact</th>
                  <th className="py-2.5 pr-4 font-medium">Credit limit</th>
                  <th className="py-2.5 pr-4 font-medium">Outstanding</th>
                  <th className="py-2.5 pr-4 font-medium">Orders</th>
                  <th className="py-2.5 pr-4 font-medium">Status</th>
                  <th className="py-2.5 pr-4 font-medium" />
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.id} className="border-b last:border-0">
                    <td className="py-3 pr-4 font-medium">
                      <Link
                        href={`/admin/clients/${client.id}`}
                        className="hover:text-primary hover:underline"
                      >
                        {client.companyName}
                      </Link>
                    </td>
                    <td className="text-muted-foreground py-3 pr-4">
                      <p>{client.contactName}</p>
                      <p className="text-xs">{client.email}</p>
                    </td>
                    <td className="py-3 pr-4">{formatCurrency(client.creditLimit)}</td>
                    <td className="py-3 pr-4">
                      <span className={client.outstandingBalance > 0 ? 'text-warning' : ''}>
                        {formatCurrency(client.outstandingBalance)}
                      </span>
                    </td>
                    <td className="text-muted-foreground py-3 pr-4">{client.orderCount}</td>
                    <td className="py-3 pr-4">
                      <Badge variant={client.status === 'active' ? 'success' : 'destructive'}>
                        {client.status === 'active' ? 'Active' : 'Suspended'}
                        {client.creditFrozen ? ' · Frozen' : ''}
                      </Badge>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-1">
                        <Button size="icon" variant="ghost" asChild aria-label="View client">
                          <Link href={`/admin/clients/${client.id}`}>
                            <ArrowUpRight className="h-4 w-4" />
                          </Link>
                        </Button>
                        {client.status === 'active' ? (
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setClientStatus(client.id, 'suspended')}
                            aria-label="Suspend client"
                          >
                            <Ban className="text-destructive h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setClientStatus(client.id, 'active')}
                            aria-label="Reactivate client"
                          >
                            <ShieldCheck className="text-success h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Modal
        open={open}
        onOpenChange={setOpen}
        title="New client"
        description="Register a new business client and set their initial credit limit."
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>Create client</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Company name</Label>
            <Input
              value={form.companyName}
              onChange={(e) => setForm({ ...form, companyName: e.target.value })}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Contact name</Label>
              <Input
                value={form.contactName}
                onChange={(e) => setForm({ ...form, contactName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Initial credit limit</Label>
              <Input
                type="number"
                min={0}
                value={form.creditLimit}
                onChange={(e) => setForm({ ...form, creditLimit: Number(e.target.value) })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Address</Label>
            <Input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
