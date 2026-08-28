import type { Metadata } from 'next';
import { BookOpen, Landmark, PiggyBank, Scale } from 'lucide-react';
import { KpiCard } from '@/components/shared/kpi-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RevenueTrendChart, CategoryBarChart } from '@/components/charts';
import { InvoiceStatusBadge } from '@/features/finance/invoice-status-badge';
import { ledgerEntries, monthlyRevenue, invoices } from '@/lib/mock-data';
import { formatCurrency, formatDate } from '@/lib/utils';

export const metadata: Metadata = { title: 'Accounting ERP' };

const cashFlow = [
  { label: 'Operating', value: 186400 },
  { label: 'Investing', value: -42000 },
  { label: 'Financing', value: -18500 },
];

const balanceSheet = {
  assets: [
    { label: 'Cash & equivalents', value: 412000 },
    { label: 'Accounts receivable', value: 96200 },
    { label: 'Inventory', value: 2840000 },
    { label: 'Fixed assets', value: 218000 },
  ],
  liabilities: [
    { label: 'Accounts payable', value: 184500 },
    { label: 'Short-term debt', value: 60000 },
    { label: 'Accrued liabilities', value: 32800 },
  ],
  equity: [{ label: "Owner's equity", value: 3288900 }],
};

export default function AccountingPage() {
  const totalRevenue = monthlyRevenue.reduce((s, m) => s + m.revenue, 0);
  const totalExpenses = monthlyRevenue.reduce((s, m) => s + m.expenses, 0);
  const totalProfit = monthlyRevenue.reduce((s, m) => s + m.profit, 0);
  const totalAssets = balanceSheet.assets.reduce((s, a) => s + a.value, 0);
  const totalLiabilities = balanceSheet.liabilities.reduce((s, a) => s + a.value, 0);

  const receivables = invoices.filter((i) => i.type === 'receivable');
  const payables = invoices.filter((i) => i.type === 'payable');
  const totalReceivable = receivables.reduce((sum, i) => sum + (i.amount - i.amountPaid), 0);
  const totalPayable = payables.reduce((sum, i) => sum + (i.amount - i.amountPaid), 0);

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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Accounting ERP</h2>
        <p className="text-muted-foreground">
          General ledger, journal entries, receivables, payables, and financial statements — all in
          one place.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Net income (7 mo)"
          value={formatCurrency(totalProfit)}
          icon={PiggyBank}
          iconTone="success"
          delta={9.8}
        />
        <KpiCard
          label="Total assets"
          value={formatCurrency(totalAssets)}
          icon={Landmark}
          iconTone="primary"
        />
        <KpiCard
          label="Total liabilities"
          value={formatCurrency(totalLiabilities)}
          icon={Scale}
          iconTone="warning"
        />
        <KpiCard
          label="GL entries (30d)"
          value={ledgerEntries.length.toString()}
          icon={BookOpen}
          iconTone="info"
        />
      </div>

      <Tabs defaultValue="pnl">
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
                  <p className="text-success text-lg font-bold">{formatCurrency(totalProfit)}</p>
                </div>
              </div>
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
                {balanceSheet.assets.map((item) => (
                  <div key={item.label} className="flex justify-between">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-medium">{formatCurrency(item.value)}</span>
                  </div>
                ))}
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
                {balanceSheet.liabilities.map((item) => (
                  <div key={item.label} className="flex justify-between">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-medium">{formatCurrency(item.value)}</span>
                  </div>
                ))}
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
                {balanceSheet.equity.map((item) => (
                  <div key={item.label} className="flex justify-between">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-medium">{formatCurrency(item.value)}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cash-flow">
          <Card>
            <CardHeader>
              <CardTitle>Cash flow breakdown</CardTitle>
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
                Aggregated debit/credit activity grouped by account.
              </p>
            </CardHeader>
            <CardContent className="overflow-x-auto">
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
                    <tr key={entry.id} className="border-b last:border-0">
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
    </div>
  );
}
