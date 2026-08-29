'use client';

import { useEffect, useState } from 'react';
import { BookOpen, CheckCircle2, Landmark, PiggyBank, Plus, Scale } from 'lucide-react';
import { KpiCard } from '@/components/shared/kpi-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Loader } from '@/components/ui/loader';
import { RevenueTrendChart, CategoryBarChart } from '@/components/charts';
import { InvoiceStatusBadge } from '@/features/finance/invoice-status-badge';
import {
  useCreateLedgerEntry,
  useInvoices,
  useLedgerEntries,
  useMonthlyRevenue,
} from '@/services/queries';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function AccountingPage() {
  const { data: invoices = [], isLoading: invoicesLoading } = useInvoices();
  const { data: ledgerEntries = [], isLoading: ledgerLoading } = useLedgerEntries();
  const { data: monthlyRevenue = [] } = useMonthlyRevenue();
  const createEntry = useCreateLedgerEntry();

  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('ledger');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [highlightEntryId, setHighlightEntryId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    account: 'Cash / Bank',
    description: '',
    debit: 0,
    credit: 0,
  });

  const totalRevenue = monthlyRevenue.reduce((s, m) => s + m.revenue, 0);
  const totalExpenses = monthlyRevenue.reduce((s, m) => s + m.expenses, 0);
  const totalProfit = monthlyRevenue.reduce((s, m) => s + m.profit, 0);

  const accountTotals = new Map<string, { debit: number; credit: number }>();
  for (const entry of ledgerEntries) {
    const current = accountTotals.get(entry.account) ?? { debit: 0, credit: 0 };
    current.debit += entry.debit;
    current.credit += entry.credit;
    accountTotals.set(entry.account, current);
  }
  const trialBalance = Array.from(accountTotals.entries()).map(([account, totals]) => ({
    account,
    ...totals,
    balance: totals.debit - totals.credit,
  }));
  const trialDebitTotal = trialBalance.reduce((sum, row) => sum + row.debit, 0);
  const trialCreditTotal = trialBalance.reduce((sum, row) => sum + row.credit, 0);

  const cash = trialBalance.find((row) => row.account.toLowerCase().includes('cash'));
  const ar = trialBalance.find((row) => row.account.toLowerCase().includes('receivable'));
  const ap = trialBalance.find((row) => row.account.toLowerCase().includes('payable'));
  const cashBalance = cash ? cash.debit - cash.credit : 0;
  const arBalance = ar ? ar.debit - ar.credit : 0;
  const apBalance = ap ? ap.credit - ap.debit : 0;

  const cashFlow = [
    { label: 'Cash / Bank', value: cashBalance },
    { label: 'Receivables', value: arBalance },
    { label: 'Payables', value: -apBalance },
  ];

  const receivables = invoices.filter((i) => i.type === 'receivable');
  const payables = invoices.filter((i) => i.type === 'payable');
  const totalReceivable = receivables.reduce((sum, i) => sum + (i.amount - i.amountPaid), 0);
  const totalPayable = payables.reduce((sum, i) => sum + (i.amount - i.amountPaid), 0);

  const totalAssets = cashBalance + Math.max(arBalance, 0);
  const totalLiabilities = Math.max(apBalance, 0);

  useEffect(() => {
    if (!successMessage) return;
    const timer = window.setTimeout(() => setSuccessMessage(null), 6000);
    return () => window.clearTimeout(timer);
  }, [successMessage]);

  async function handlePost() {
    if (!form.account.trim()) {
      setFormError('Account is required.');
      return;
    }
    if (form.debit <= 0 && form.credit <= 0) {
      setFormError('Enter a debit or credit amount greater than 0.');
      return;
    }
    if (form.debit > 0 && form.credit > 0) {
      setFormError('Enter either a debit or a credit, not both on one line.');
      return;
    }

    setFormError(null);
    try {
      const entry = await createEntry.mutateAsync({
        ...form,
        description: form.description.trim() || `Journal entry — ${form.account.trim()}`,
      });
      setSuccessMessage(
        `Saved — ${entry.account} ${entry.debit > 0 ? `debit ${formatCurrency(entry.debit)}` : `credit ${formatCurrency(entry.credit)}`}. See Journal Entries tab.`,
      );
      setHighlightEntryId(entry.id);
      setActiveTab('journal');
      setOpen(false);
      setForm({
        date: new Date().toISOString().slice(0, 10),
        account: 'Cash / Bank',
        description: '',
        debit: 0,
        credit: 0,
      });
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Unable to post entry');
    }
  }

  if (invoicesLoading || ledgerLoading) {
    return <Loader label="Loading general ledger..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Accounting ERP</h2>
          <p className="text-muted-foreground">
            Live general ledger, journal entries, receivables, and payables from invoices and
            payments.
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> Post journal entry
        </Button>
      </div>

      {successMessage ? (
        <div className="border-success/30 bg-success/10 text-success flex items-center gap-2 rounded-lg border px-4 py-3 text-sm">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <p>{successMessage}</p>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Net income"
          value={formatCurrency(totalProfit)}
          icon={PiggyBank}
          iconTone="success"
        />
        <KpiCard
          label="Cash & receivables"
          value={formatCurrency(totalAssets)}
          icon={Landmark}
          iconTone="primary"
        />
        <KpiCard
          label="Accounts payable"
          value={formatCurrency(totalLiabilities)}
          icon={Scale}
          iconTone="warning"
        />
        <KpiCard
          label="GL entries"
          value={ledgerEntries.length.toString()}
          icon={BookOpen}
          iconTone="info"
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="pnl">Profit & Loss</TabsTrigger>
          <TabsTrigger value="balance-sheet">Balance Sheet</TabsTrigger>
          <TabsTrigger value="cash-flow">Cash Flow</TabsTrigger>
          <TabsTrigger value="ledger">General Ledger</TabsTrigger>
          <TabsTrigger value="journal">Journal Entries</TabsTrigger>
          <TabsTrigger value="trial-balance">Trial Balance</TabsTrigger>
          <TabsTrigger value="receivable">Accounts Receivable</TabsTrigger>
          <TabsTrigger value="payable">Accounts Payable</TabsTrigger>
        </TabsList>

        <TabsContent value="pnl">
          <Card>
            <CardHeader>
              <CardTitle>Revenue vs. expenses</CardTitle>
            </CardHeader>
            <CardContent>
              {monthlyRevenue.length === 0 ? (
                <p className="text-muted-foreground py-8 text-center text-sm">
                  No monthly revenue series yet.
                </p>
              ) : (
                <>
                  <RevenueTrendChart
                    data={monthlyRevenue}
                    xKey="month"
                    series={[
                      { key: 'revenue', color: 'hsl(var(--chart-1))', label: 'Revenue' },
                      { key: 'expenses', color: 'hsl(var(--chart-5))', label: 'Expenses' },
                      { key: 'profit', color: 'hsl(var(--chart-3))', label: 'Profit' },
                    ]}
                  />
                  <div className="mt-4 grid grid-cols-3 gap-4 border-t pt-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Total revenue</p>
                      <p className="text-lg font-bold">{formatCurrency(totalRevenue)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total expenses</p>
                      <p className="text-lg font-bold">{formatCurrency(totalExpenses)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Net profit</p>
                      <p className="text-success text-lg font-bold">
                        {formatCurrency(totalProfit)}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="balance-sheet">
          <div className="grid gap-4 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Assets</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cash & bank</span>
                  <span className="font-medium">{formatCurrency(cashBalance)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Accounts receivable</span>
                  <span className="font-medium">{formatCurrency(arBalance)}</span>
                </div>
                <div className="flex justify-between border-t pt-2 font-bold">
                  <span>Total</span>
                  <span>{formatCurrency(totalAssets)}</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Liabilities</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Accounts payable</span>
                  <span className="font-medium">{formatCurrency(apBalance)}</span>
                </div>
                <div className="flex justify-between border-t pt-2 font-bold">
                  <span>Total</span>
                  <span>{formatCurrency(totalLiabilities)}</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Equity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Retained earnings (plug)</span>
                  <span className="font-medium">
                    {formatCurrency(totalAssets - totalLiabilities)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cash-flow">
          <Card>
            <CardHeader>
              <CardTitle>Cash position from the ledger</CardTitle>
            </CardHeader>
            <CardContent>
              <CategoryBarChart data={cashFlow} layout="vertical" height={200} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ledger">
          <Card>
            <CardHeader>
              <CardTitle>General ledger — account balances</CardTitle>
              <p className="text-muted-foreground text-sm">
                Aggregated debit/credit activity grouped by account. For each posted line, open{' '}
                <button
                  type="button"
                  className="text-primary font-medium hover:underline"
                  onClick={() => setActiveTab('journal')}
                >
                  Journal Entries
                </button>
                .
              </p>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              {trialBalance.length === 0 ? (
                <p className="text-muted-foreground py-8 text-center text-sm">
                  No ledger activity yet. Generate an invoice or post a journal entry.
                </p>
              ) : (
                <table className="w-full min-w-[560px] text-sm">
                  <thead className="text-muted-foreground text-left text-xs tracking-wide uppercase">
                    <tr className="border-b">
                      <th className="py-2.5 pr-4 font-medium">Account</th>
                      <th className="py-2.5 pr-4 text-right font-medium">Total debit</th>
                      <th className="py-2.5 pr-4 text-right font-medium">Total credit</th>
                      <th className="py-2.5 pr-4 text-right font-medium">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trialBalance.map((row) => (
                      <tr key={row.account} className="border-b last:border-0">
                        <td className="py-3 pr-4 font-medium">{row.account}</td>
                        <td className="py-3 pr-4 text-right">{formatCurrency(row.debit)}</td>
                        <td className="py-3 pr-4 text-right">{formatCurrency(row.credit)}</td>
                        <td
                          className={`py-3 pr-4 text-right font-medium ${row.balance >= 0 ? 'text-success' : 'text-destructive'}`}
                        >
                          {formatCurrency(row.balance)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="journal">
          <Card>
            <CardHeader>
              <CardTitle>Journal entries</CardTitle>
              <p className="text-muted-foreground text-sm">Chronological double-entry postings.</p>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              {ledgerEntries.length === 0 ? (
                <p className="text-muted-foreground py-8 text-center text-sm">
                  No journal entries yet. Post one with the button above.
                </p>
              ) : (
                <table className="w-full min-w-[640px] text-sm">
                  <thead className="text-muted-foreground text-left text-xs tracking-wide uppercase">
                    <tr className="border-b">
                      <th className="py-2.5 pr-4 font-medium">Date</th>
                      <th className="py-2.5 pr-4 font-medium">Account</th>
                      <th className="py-2.5 pr-4 font-medium">Description</th>
                      <th className="py-2.5 pr-4 text-right font-medium">Debit</th>
                      <th className="py-2.5 pr-4 text-right font-medium">Credit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ledgerEntries.map((entry) => (
                      <tr
                        key={entry.id}
                        className={`border-b last:border-0 ${highlightEntryId === entry.id ? 'bg-primary/10' : ''}`}
                      >
                        <td className="text-muted-foreground py-3 pr-4">{formatDate(entry.date)}</td>
                        <td className="py-3 pr-4 font-medium">{entry.account}</td>
                        <td className="text-muted-foreground py-3 pr-4">{entry.description}</td>
                        <td className="py-3 pr-4 text-right">
                          {entry.debit ? formatCurrency(entry.debit) : '—'}
                        </td>
                        <td className="py-3 pr-4 text-right">
                          {entry.credit ? formatCurrency(entry.credit) : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trial-balance">
          <Card>
            <CardHeader>
              <CardTitle>Trial balance</CardTitle>
              <p className="text-muted-foreground text-sm">
                Total debits must equal total credits across all accounts.
              </p>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <thead className="text-muted-foreground text-left text-xs tracking-wide uppercase">
                  <tr className="border-b">
                    <th className="py-2.5 pr-4 font-medium">Account</th>
                    <th className="py-2.5 pr-4 text-right font-medium">Debit</th>
                    <th className="py-2.5 pr-4 text-right font-medium">Credit</th>
                  </tr>
                </thead>
                <tbody>
                  {trialBalance.map((row) => (
                    <tr key={row.account} className="border-b last:border-0">
                      <td className="py-3 pr-4 font-medium">{row.account}</td>
                      <td className="py-3 pr-4 text-right">{formatCurrency(row.debit)}</td>
                      <td className="py-3 pr-4 text-right">{formatCurrency(row.credit)}</td>
                    </tr>
                  ))}
                  <tr className="font-bold">
                    <td className="py-3 pr-4">Total</td>
                    <td className="py-3 pr-4 text-right">{formatCurrency(trialDebitTotal)}</td>
                    <td className="py-3 pr-4 text-right">{formatCurrency(trialCreditTotal)}</td>
                  </tr>
                </tbody>
              </table>
              <p
                className={`mt-3 text-xs ${trialDebitTotal === trialCreditTotal ? 'text-success' : 'text-destructive'}`}
              >
                {trialDebitTotal === trialCreditTotal
                  ? 'Balanced — debits equal credits.'
                  : 'Out of balance — review journal entries.'}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="receivable">
          <Card>
            <CardHeader>
              <CardTitle>Accounts receivable</CardTitle>
              <p className="text-muted-foreground text-sm">
                Total outstanding: {formatCurrency(totalReceivable)}
              </p>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="text-muted-foreground text-left text-xs tracking-wide uppercase">
                  <tr className="border-b">
                    <th className="py-2.5 pr-4 font-medium">Invoice</th>
                    <th className="py-2.5 pr-4 font-medium">Client</th>
                    <th className="py-2.5 pr-4 font-medium">Due date</th>
                    <th className="py-2.5 pr-4 text-right font-medium">Balance</th>
                    <th className="py-2.5 pr-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {receivables.map((invoice) => (
                    <tr key={invoice.id} className="border-b last:border-0">
                      <td className="py-3 pr-4 font-medium">{invoice.invoiceNumber}</td>
                      <td className="text-muted-foreground py-3 pr-4">
                        {invoice.vendorOrCustomer}
                      </td>
                      <td className="text-muted-foreground py-3 pr-4">
                        {formatDate(invoice.dueDate)}
                      </td>
                      <td className="py-3 pr-4 text-right font-medium">
                        {formatCurrency(invoice.amount - invoice.amountPaid)}
                      </td>
                      <td className="py-3 pr-4">
                        <InvoiceStatusBadge status={invoice.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payable">
          <Card>
            <CardHeader>
              <CardTitle>Accounts payable</CardTitle>
              <p className="text-muted-foreground text-sm">
                Total outstanding: {formatCurrency(totalPayable)}
              </p>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="text-muted-foreground text-left text-xs tracking-wide uppercase">
                  <tr className="border-b">
                    <th className="py-2.5 pr-4 font-medium">Bill</th>
                    <th className="py-2.5 pr-4 font-medium">Vendor</th>
                    <th className="py-2.5 pr-4 font-medium">Due date</th>
                    <th className="py-2.5 pr-4 text-right font-medium">Balance</th>
                    <th className="py-2.5 pr-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payables.map((invoice) => (
                    <tr key={invoice.id} className="border-b last:border-0">
                      <td className="py-3 pr-4 font-medium">{invoice.invoiceNumber}</td>
                      <td className="text-muted-foreground py-3 pr-4">
                        {invoice.vendorOrCustomer}
                      </td>
                      <td className="text-muted-foreground py-3 pr-4">
                        {formatDate(invoice.dueDate)}
                      </td>
                      <td className="py-3 pr-4 text-right font-medium">
                        {formatCurrency(invoice.amount - invoice.amountPaid)}
                      </td>
                      <td className="py-3 pr-4">
                        <InvoiceStatusBadge status={invoice.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Modal
        open={open}
        onOpenChange={setOpen}
        title="Post journal entry"
        description="Adds a single-sided line. After posting, it is saved under Journal Entries and updates General Ledger totals."
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handlePost}
              disabled={
                createEntry.isPending ||
                !form.account.trim() ||
                (form.debit <= 0 && form.credit <= 0) ||
                (form.debit > 0 && form.credit > 0)
              }
            >
              {createEntry.isPending ? 'Posting...' : 'Post entry'}
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
            <Label>Account</Label>
            <Input
              value={form.account}
              onChange={(e) => setForm({ ...form, account: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Description (optional)</Label>
            <Input
              value={form.description}
              placeholder="e.g. Bank deposit, petty cash"
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Debit</Label>
              <Input
                type="number"
                min={0}
                step="0.01"
                value={form.debit}
                onChange={(e) => setForm({ ...form, debit: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>Credit</Label>
              <Input
                type="number"
                min={0}
                step="0.01"
                value={form.credit}
                onChange={(e) => setForm({ ...form, credit: Number(e.target.value) })}
              />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
