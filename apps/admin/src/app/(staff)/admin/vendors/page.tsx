'use client';

import { useMemo, useState } from 'react';
import { Check, Plus, ShieldOff, Store, TrendingUp, X } from 'lucide-react';
import { KpiCard } from '@/components/shared/kpi-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge, type BadgeProps } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Loader } from '@/components/ui/loader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useVendors, useRegisterVendor, useUpdateVendor, useCategories } from '@/services/queries';
import type { CreateVendorInput } from '@/schemas/vendor.schema';
import type { Vendor, VendorStatus } from '@/types/catalog';

const statusConfig: Record<VendorStatus, { label: string; variant: BadgeProps['variant'] }> = {
  pending: { label: 'Pending review', variant: 'warning' },
  approved: { label: 'Approved', variant: 'success' },
  rejected: { label: 'Rejected', variant: 'destructive' },
  suspended: { label: 'Suspended', variant: 'secondary' },
};

function performanceVariant(score: number): BadgeProps['variant'] {
  if (score >= 85) return 'success';
  if (score >= 70) return 'info';
  if (score >= 50) return 'warning';
  return 'destructive';
}

const emptyForm: CreateVendorInput = {
  name: '',
  logo: 'https://api.dicebear.com/9.x/initials/svg?seed=New%20Vendor',
  banner:
    'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200&auto=format&fit=crop',
  location: '',
  responseTime: '< 24 hours',
  certifications: [],
  categories: [],
  contactPerson: '',
  email: '',
  phone: '',
  address: '',
};

function VendorTable({
  vendors,
  onApprove,
  onReject,
  onSuspend,
  onReactivate,
}: {
  vendors: Vendor[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onSuspend: (id: string) => void;
  onReactivate: (id: string) => void;
}) {
  if (vendors.length === 0) {
    return (
      <p className="text-muted-foreground py-8 text-center text-sm">No vendors in this view.</p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[820px] text-sm">
        <thead className="text-muted-foreground text-left text-xs tracking-wide uppercase">
          <tr className="border-b">
            <th className="py-2.5 pr-4 font-medium">Company</th>
            <th className="py-2.5 pr-4 font-medium">Contact</th>
            <th className="py-2.5 pr-4 font-medium">Email / Phone</th>
            <th className="py-2.5 pr-4 font-medium">Categories</th>
            <th className="py-2.5 pr-4 font-medium">Performance</th>
            <th className="py-2.5 pr-4 font-medium">Status</th>
            <th className="py-2.5 pr-4 font-medium" />
          </tr>
        </thead>
        <tbody>
          {vendors.map((vendor) => (
            <tr key={vendor.id} className="border-b last:border-0">
              <td className="py-3 pr-4 font-medium">{vendor.name}</td>
              <td className="text-muted-foreground py-3 pr-4">{vendor.contactPerson}</td>
              <td className="text-muted-foreground py-3 pr-4">
                <p>{vendor.email}</p>
                <p className="text-xs">{vendor.phone}</p>
              </td>
              <td className="text-muted-foreground py-3 pr-4">{vendor.categories.length}</td>
              <td className="py-3 pr-4">
                <Badge variant={performanceVariant(vendor.performanceScore)}>
                  {vendor.performanceScore}/100
                </Badge>
              </td>
              <td className="py-3 pr-4">
                <Badge variant={statusConfig[vendor.status].variant}>
                  {statusConfig[vendor.status].label}
                </Badge>
              </td>
              <td className="py-3 pr-4">
                <div className="flex flex-wrap items-center gap-1.5">
                  {vendor.status === 'pending' ? (
                    <>
                      <Button size="sm" variant="outline" onClick={() => onApprove(vendor.id)}>
                        <Check className="h-3.5 w-3.5" /> Approve
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => onReject(vendor.id)}>
                        <X className="h-3.5 w-3.5" /> Reject
                      </Button>
                    </>
                  ) : null}
                  {vendor.status === 'approved' ? (
                    <Button size="sm" variant="outline" onClick={() => onSuspend(vendor.id)}>
                      <ShieldOff className="h-3.5 w-3.5" /> Suspend
                    </Button>
                  ) : null}
                  {vendor.status === 'suspended' || vendor.status === 'rejected' ? (
                    <Button size="sm" variant="outline" onClick={() => onReactivate(vendor.id)}>
                      <Check className="h-3.5 w-3.5" /> Approve
                    </Button>
                  ) : null}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminVendorsPage() {
  const { data: vendors = [], isLoading } = useVendors();
  const { data: categories = [] } = useCategories();
  const registerVendor = useRegisterVendor();
  const updateVendor = useUpdateVendor();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CreateVendorInput>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [listError, setListError] = useState<string | null>(null);

  const pending = vendors.filter((v) => v.status === 'pending');
  const approved = vendors.filter((v) => v.status === 'approved');
  const other = vendors.filter((v) => v.status === 'rejected' || v.status === 'suspended');

  const avgPerformance = useMemo(() => {
    if (approved.length === 0) return 0;
    return Math.round(approved.reduce((sum, v) => sum + v.performanceScore, 0) / approved.length);
  }, [approved]);
  const topVendor = useMemo(
    () => approved.slice().sort((a, b) => b.performanceScore - a.performanceScore)[0],
    [approved],
  );
  const atRiskVendors = approved.filter((v) => v.performanceScore < 70);

  async function handleRegister() {
    if (!form.name.trim() || !form.email.trim()) return;
    setFormError(null);
    try {
      await registerVendor.mutateAsync(form);
      setForm(emptyForm);
      setOpen(false);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Unable to register vendor');
    }
  }

  function setVendorStatus(id: string, status: VendorStatus) {
    setListError(null);
    updateVendor.mutate(
      { id, status },
      {
        onError: (error) =>
          setListError(error instanceof Error ? error.message : 'Unable to update vendor'),
      },
    );
  }

  if (isLoading) {
    return <Loader label="Loading vendors..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Vendors</h2>
          <p className="text-muted-foreground">
            Register, approve, reject, and manage marketplace vendors.
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> Register vendor
        </Button>
      </div>

      {listError ? (
        <p className="border-destructive/30 bg-destructive/5 text-destructive rounded-lg border p-3 text-sm">
          {listError}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard
          label="Avg. vendor performance"
          value={`${avgPerformance}/100`}
          icon={TrendingUp}
          iconTone="primary"
        />
        <KpiCard
          label="Top performer"
          value={topVendor ? topVendor.name : '—'}
          icon={TrendingUp}
          iconTone="success"
        />
        <KpiCard
          label="At-risk vendors (<70)"
          value={atRiskVendors.length.toString()}
          icon={TrendingUp}
          iconTone="warning"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-4 w-4" /> All vendors ({vendors.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending">
            <TabsList>
              <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
              <TabsTrigger value="approved">Approved ({approved.length})</TabsTrigger>
              <TabsTrigger value="other">Rejected / Suspended ({other.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="pending">
              <VendorTable
                vendors={pending}
                onApprove={(id) => setVendorStatus(id, 'approved')}
                onReject={(id) => setVendorStatus(id, 'rejected')}
                onSuspend={(id) => setVendorStatus(id, 'suspended')}
                onReactivate={(id) => setVendorStatus(id, 'approved')}
              />
            </TabsContent>
            <TabsContent value="approved">
              <VendorTable
                vendors={approved}
                onApprove={(id) => setVendorStatus(id, 'approved')}
                onReject={(id) => setVendorStatus(id, 'rejected')}
                onSuspend={(id) => setVendorStatus(id, 'suspended')}
                onReactivate={(id) => setVendorStatus(id, 'approved')}
              />
            </TabsContent>
            <TabsContent value="other">
              <VendorTable
                vendors={other}
                onApprove={(id) => setVendorStatus(id, 'approved')}
                onReject={(id) => setVendorStatus(id, 'rejected')}
                onSuspend={(id) => setVendorStatus(id, 'suspended')}
                onReactivate={(id) => setVendorStatus(id, 'approved')}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Modal
        open={open}
        onOpenChange={setOpen}
        title="Register vendor"
        description="New vendors start in pending status until approved."
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRegister} disabled={registerVendor.isPending}>
              {registerVendor.isPending ? 'Registering...' : 'Register vendor'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {formError ? (
            <p className="border-destructive/30 bg-destructive/5 text-destructive rounded-lg border p-3 text-sm">
              {formError}
            </p>
          ) : null}
          <div className="space-y-2">
            <Label>Company name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Contact person</Label>
              <Input
                value={form.contactPerson}
                onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
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
              <Label>Location</Label>
              <Input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="City, State"
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
          <div className="space-y-2">
            <Label>Product categories</Label>
            <div className="grid max-h-40 gap-2 overflow-y-auto rounded-md border p-3">
              {categories.length === 0 ? (
                <p className="text-muted-foreground text-sm">Create categories first.</p>
              ) : (
                categories.map((category) => {
                  const checked = form.categories.includes(category.id);
                  return (
                    <label key={category.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          setForm({
                            ...form,
                            categories: checked
                              ? form.categories.filter((id) => id !== category.id)
                              : [...form.categories, category.id],
                          })
                        }
                      />
                      {category.name}
                    </label>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
