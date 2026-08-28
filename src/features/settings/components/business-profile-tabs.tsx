'use client';

import { useState } from 'react';
import { MapPin, Plus, Save, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { useCurrentClient } from '@/hooks/use-current-client';
import { useAdminStore } from '@/store/admin-store';
import type { ClientAddress } from '@/types/admin';

function BusinessInformationTab() {
  const client = useCurrentClient();
  const updateClient = useAdminStore((state) => state.updateClient);
  const [form, setForm] = useState(() => ({
    companyName: client?.companyName ?? '',
    contactName: client?.contactName ?? '',
    phone: client?.phone ?? '',
    address: client?.address ?? '',
  }));
  const [saved, setSaved] = useState(false);

  if (!client) {
    return (
      <EmptyState
        title="No business record"
        description="Business information will appear here once linked."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Company name</Label>
          <Input
            value={form.companyName}
            onChange={(e) => setForm({ ...form, companyName: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Primary contact</Label>
          <Input
            value={form.contactName}
            onChange={(e) => setForm({ ...form, contactName: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Phone</Label>
          <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Registered address</Label>
          <Input
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
        </div>
      </div>
      <Button
        onClick={() => {
          updateClient(client.id, form);
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        }}
      >
        <Save className="h-4 w-4" /> {saved ? 'Saved' : 'Save changes'}
      </Button>
    </div>
  );
}

function AddressesTab() {
  const client = useCurrentClient();
  const updateClient = useAdminStore((state) => state.updateClient);
  const [showForm, setShowForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United States',
  });

  if (!client) {
    return (
      <EmptyState
        title="No addresses"
        description="Delivery addresses will appear here once linked."
      />
    );
  }

  function addAddress() {
    if (!newAddress.label || !newAddress.line1 || !newAddress.city) return;
    const address: ClientAddress = {
      id: `addr_${Date.now()}`,
      ...newAddress,
      isDefault: client!.addresses.length === 0,
    };
    updateClient(client!.id, { addresses: [...client!.addresses, address] });
    setNewAddress({
      label: '',
      line1: '',
      line2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'United States',
    });
    setShowForm(false);
  }

  function removeAddress(id: string) {
    updateClient(client!.id, { addresses: client!.addresses.filter((a) => a.id !== id) });
  }

  function makeDefault(id: string) {
    updateClient(client!.id, {
      addresses: client!.addresses.map((a) => ({ ...a, isDefault: a.id === id })),
    });
  }

  return (
    <div className="space-y-4">
      {client.addresses.length === 0 ? (
        <EmptyState
          title="No delivery addresses"
          description="Add an address for faster checkout."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {client.addresses.map((address) => (
            <div key={address.id} className="rounded-xl border p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 font-medium">
                  <MapPin className="text-primary h-4 w-4" /> {address.label}
                  {address.isDefault ? <Badge variant="brand">Default</Badge> : null}
                </div>
                <button
                  type="button"
                  onClick={() => removeAddress(address.id)}
                  aria-label="Remove address"
                >
                  <Trash2 className="text-muted-foreground hover:text-destructive h-4 w-4" />
                </button>
              </div>
              <p className="text-muted-foreground mt-2 text-sm">
                {address.line1}
                {address.line2 ? `, ${address.line2}` : ''}
                <br />
                {address.city}, {address.state} {address.postalCode}
                <br />
                {address.country}
              </p>
              {!address.isDefault ? (
                <Button
                  variant="link"
                  size="sm"
                  className="mt-1 h-auto p-0"
                  onClick={() => makeDefault(address.id)}
                >
                  Set as default
                </Button>
              ) : null}
            </div>
          ))}
        </div>
      )}

      {showForm ? (
        <div className="space-y-3 rounded-xl border p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              placeholder="Label (e.g. Warehouse)"
              value={newAddress.label}
              onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
            />
            <Input
              placeholder="Address line 1"
              value={newAddress.line1}
              onChange={(e) => setNewAddress({ ...newAddress, line1: e.target.value })}
            />
            <Input
              placeholder="Address line 2 (optional)"
              value={newAddress.line2}
              onChange={(e) => setNewAddress({ ...newAddress, line2: e.target.value })}
            />
            <Input
              placeholder="City"
              value={newAddress.city}
              onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
            />
            <Input
              placeholder="State"
              value={newAddress.state}
              onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
            />
            <Input
              placeholder="Postal code"
              value={newAddress.postalCode}
              onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
            />
            <Input
              placeholder="Country"
              value={newAddress.country}
              onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={addAddress}>Save address</Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button variant="outline" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" /> Add delivery address
        </Button>
      )}
    </div>
  );
}

function BillingInformationTab() {
  const client = useCurrentClient();
  const updateClient = useAdminStore((state) => state.updateClient);
  const [form, setForm] = useState(() => ({
    taxId: client?.taxId ?? '',
    billingEmail: client?.billingEmail ?? '',
  }));
  const [saved, setSaved] = useState(false);

  if (!client) {
    return (
      <EmptyState
        title="No billing profile"
        description="Billing information will appear here once linked."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Tax ID / EIN</Label>
          <Input value={form.taxId} onChange={(e) => setForm({ ...form, taxId: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Billing email</Label>
          <Input
            type="email"
            value={form.billingEmail}
            onChange={(e) => setForm({ ...form, billingEmail: e.target.value })}
          />
        </div>
      </div>
      <Button
        onClick={() => {
          updateClient(client.id, form);
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        }}
      >
        <Save className="h-4 w-4" /> {saved ? 'Saved' : 'Save changes'}
      </Button>
    </div>
  );
}

export function BusinessProfileTabs() {
  return (
    <Card className="max-w-3xl">
      <CardHeader>
        <CardTitle>Business & billing</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="business">
          <TabsList>
            <TabsTrigger value="business">Business information</TabsTrigger>
            <TabsTrigger value="addresses">Delivery addresses</TabsTrigger>
            <TabsTrigger value="billing">Billing information</TabsTrigger>
          </TabsList>
          <TabsContent value="business">
            <BusinessInformationTab />
          </TabsContent>
          <TabsContent value="addresses">
            <AddressesTab />
          </TabsContent>
          <TabsContent value="billing">
            <BillingInformationTab />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
