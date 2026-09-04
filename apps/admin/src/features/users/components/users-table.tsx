'use client';

import { useState } from 'react';
import { Ban, Copy, Plus, Trash2, Unlock } from 'lucide-react';
import { ROLES, type Role } from '@/constants/roles';
import { CREDIT_TERMS, type CreditTerms } from '@/constants/credit-terms';
import {
  useCreateClientLogin,
  useCreateStaff,
  useDeleteStaff,
  useUpdateStaff,
  useUsers,
} from '@/services/queries';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Modal } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditTermsSelect } from '@/components/shared/credit-terms-select';
import type { User } from '@/types/auth';
import type { CreateStaffInput } from '@/schemas/user.schema';
import type { IssuedCredentials } from '@/services/api/users.service';

const STAFF_ROLES: Role[] = [
  ROLES.SUPER_ADMIN,
  ROLES.ADMIN,
  ROLES.FINANCE_MANAGER,
  ROLES.PROCUREMENT_MANAGER,
  ROLES.INVENTORY_MANAGER,
  ROLES.SALES_MANAGER,
  ROLES.MANAGER,
  ROLES.VIEWER,
];

const emptyStaff: CreateStaffInput = {
  firstName: '',
  lastName: '',
  email: undefined,
  password: undefined,
  role: ROLES.ADMIN,
};

const emptyClient = {
  firstName: '',
  lastName: '',
  companyName: '',
  email: '',
  phone: '',
  creditLimit: 5000,
  creditTerms: CREDIT_TERMS.NET_30 as CreditTerms,
};

function credentialsText(credentials: IssuedCredentials) {
  return `Login URL: ${credentials.loginUrl}\nEmail: ${credentials.email}\nPassword: ${credentials.password}`;
}

export function UsersTable() {
  const { data = [], isLoading, isError, error } = useUsers();
  const createStaff = useCreateStaff();
  const createClientLogin = useCreateClientLogin();
  const updateStaff = useUpdateStaff();
  const deleteStaff = useDeleteStaff();

  const [staffOpen, setStaffOpen] = useState(false);
  const [clientOpen, setClientOpen] = useState(false);
  const [staffForm, setStaffForm] = useState<CreateStaffInput>(emptyStaff);
  const [clientForm, setClientForm] = useState(emptyClient);
  const [formError, setFormError] = useState<string | null>(null);
  const [issued, setIssued] = useState<IssuedCredentials | null>(null);
  const [copied, setCopied] = useState(false);

  const staffUsers = data.filter((user) => user.userType !== 'CUSTOMER');
  const clientUsers = data.filter((user) => user.userType === 'CUSTOMER');

  const actionCell = (row: User) => (
    <div className="flex flex-wrap gap-1.5">
      {row.isActive ? (
        <Button
          size="sm"
          variant="outline"
          disabled={updateStaff.isPending}
          onClick={() => updateStaff.mutate({ id: row.id, payload: { isActive: false } })}
        >
          <Ban className="h-3.5 w-3.5" /> Suspend
        </Button>
      ) : (
        <Button
          size="sm"
          variant="outline"
          disabled={updateStaff.isPending}
          onClick={() => updateStaff.mutate({ id: row.id, payload: { isActive: true } })}
        >
          <Unlock className="h-3.5 w-3.5" /> Reactivate
        </Button>
      )}
      <Button
        size="sm"
        variant="outline"
        disabled={deleteStaff.isPending}
        onClick={() => {
          if (window.confirm(`Delete account ${row.email}?`)) {
            deleteStaff.mutate(row.id);
          }
        }}
      >
        <Trash2 className="h-3.5 w-3.5" /> Delete
      </Button>
    </div>
  );

  const columns: DataTableColumn<User>[] = [
    {
      key: 'name',
      header: 'Name',
      cell: (row) => `${row.firstName} ${row.lastName}`,
    },
    { key: 'email', header: 'Email' },
    { key: 'role', header: 'Role' },
    {
      key: 'isActive',
      header: 'Status',
      cell: (row) => (row.isActive ? 'Active' : 'Suspended'),
    },
    { key: 'actions', header: 'Actions', cell: actionCell },
  ];

  async function handleCreateStaff() {
    setFormError(null);
    try {
      const result = await createStaff.mutateAsync(staffForm);
      setStaffForm(emptyStaff);
      setStaffOpen(false);
      setIssued(result.credentials);
      setCopied(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Unable to create staff account');
    }
  }

  async function handleCreateClient() {
    setFormError(null);
    try {
      const result = await createClientLogin.mutateAsync({
        firstName: clientForm.firstName,
        lastName: clientForm.lastName,
        companyName: clientForm.companyName,
        email: clientForm.email || undefined,
        phone: clientForm.phone || undefined,
        creditLimit: clientForm.creditLimit,
        creditTerms: clientForm.creditTerms,
      });
      setClientForm(emptyClient);
      setClientOpen(false);
      setIssued(result.credentials);
      setCopied(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Unable to create client login');
    }
  }

  async function copyCredentials() {
    if (!issued) return;
    await navigator.clipboard.writeText(credentialsText(issued));
    setCopied(true);
  }

  if (isError) {
    return (
      <p className="text-destructive text-sm">
        {error instanceof Error ? error.message : 'Failed to load users'}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="clients">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <TabsList>
            <TabsTrigger value="clients">Client logins</TabsTrigger>
            <TabsTrigger value="staff">Staff</TabsTrigger>
          </TabsList>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => {
                setFormError(null);
                setClientOpen(true);
              }}
            >
              <Plus className="h-4 w-4" /> New client login
            </Button>
            <Button
              className="w-full sm:w-auto"
              onClick={() => {
                setFormError(null);
                setStaffOpen(true);
              }}
            >
              <Plus className="h-4 w-4" /> Register staff
            </Button>
          </div>
        </div>

        <TabsContent value="clients" className="mt-4">
          <DataTable
            columns={columns}
            data={clientUsers}
            isLoading={isLoading}
            emptyTitle="No client logins yet"
            emptyDescription="Create a client account to generate an email and password you can share."
          />
        </TabsContent>
        <TabsContent value="staff" className="mt-4">
          <DataTable
            columns={columns}
            data={staffUsers}
            isLoading={isLoading}
            emptyTitle="No staff users found"
            emptyDescription="Register staff accounts here. There is no public admin signup."
          />
        </TabsContent>
      </Tabs>

      <Modal
        open={staffOpen}
        onOpenChange={setStaffOpen}
        title="Register staff account"
        description="Email and password are generated automatically if you leave them blank. Share the credentials once — they are not shown again."
        footer={
          <>
            <Button variant="outline" onClick={() => setStaffOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateStaff} disabled={createStaff.isPending}>
              {createStaff.isPending ? 'Creating...' : 'Create account'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>First name</Label>
              <Input
                value={staffForm.firstName}
                onChange={(e) => setStaffForm({ ...staffForm, firstName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Last name</Label>
              <Input
                value={staffForm.lastName}
                onChange={(e) => setStaffForm({ ...staffForm, lastName: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Email (optional)</Label>
            <Input
              type="email"
              placeholder="Auto-generated if empty"
              value={staffForm.email ?? ''}
              onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <select
              className="border-input bg-background h-10 w-full rounded-md border px-3 text-sm"
              value={staffForm.role}
              onChange={(e) =>
                setStaffForm({ ...staffForm, role: e.target.value as CreateStaffInput['role'] })
              }
            >
              {STAFF_ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>
          {formError ? <p className="text-destructive text-sm">{formError}</p> : null}
        </div>
      </Modal>

      <Modal
        open={clientOpen}
        onOpenChange={setClientOpen}
        title="Create client login"
        description="We generate an email and password you can copy and send to the client so they can log in on the shop."
        footer={
          <>
            <Button variant="outline" onClick={() => setClientOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateClient} disabled={createClientLogin.isPending}>
              {createClientLogin.isPending ? 'Creating...' : 'Generate login'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Company name</Label>
            <Input
              value={clientForm.companyName}
              onChange={(e) => setClientForm({ ...clientForm, companyName: e.target.value })}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>First name</Label>
              <Input
                value={clientForm.firstName}
                onChange={(e) => setClientForm({ ...clientForm, firstName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Last name</Label>
              <Input
                value={clientForm.lastName}
                onChange={(e) => setClientForm({ ...clientForm, lastName: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Email (optional)</Label>
            <Input
              type="email"
              placeholder="Auto-generated if empty"
              value={clientForm.email}
              onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Credit limit</Label>
              <Input
                type="number"
                min={0}
                value={clientForm.creditLimit}
                onChange={(e) =>
                  setClientForm({ ...clientForm, creditLimit: Number(e.target.value) })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Credit terms</Label>
              <CreditTermsSelect
                value={clientForm.creditTerms}
                onChange={(creditTerms) => setClientForm({ ...clientForm, creditTerms })}
              />
            </div>
          </div>
          {formError ? <p className="text-destructive text-sm">{formError}</p> : null}
        </div>
      </Modal>

      <Modal
        open={Boolean(issued)}
        onOpenChange={(open) => {
          if (!open) setIssued(null);
        }}
        title="Share these login details"
        description="Copy this once and send it to the user. The password is not stored in plain text."
        footer={
          <>
            <Button variant="outline" onClick={() => setIssued(null)}>
              Done
            </Button>
            <Button onClick={copyCredentials}>
              <Copy className="h-4 w-4" /> {copied ? 'Copied' : 'Copy all'}
            </Button>
          </>
        }
      >
        {issued ? (
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2">
              <div>
                <p className="text-muted-foreground text-xs">Login URL</p>
                <p className="font-medium break-all">{issued.loginUrl}</p>
              </div>
            </div>
            <div className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2">
              <div>
                <p className="text-muted-foreground text-xs">Email</p>
                <p className="font-medium break-all">{issued.email}</p>
              </div>
              <Badge>Generated</Badge>
            </div>
            <div className="rounded-lg border px-3 py-2">
              <p className="text-muted-foreground text-xs">Password</p>
              <p className="font-mono text-base font-semibold">{issued.password}</p>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
