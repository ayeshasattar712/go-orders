import { CreditCard, FileWarning, Wallet, PackageCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { formatCurrency } from '@/lib/utils';

const creditLimit = 50_000;
const creditUsed = 18_420;

export function AccountSummaryCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending payments</CardTitle>
          <FileWarning className="text-warning h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(1_820)}</div>
          <p className="text-muted-foreground text-xs">2 invoices due within 7 days</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Open invoices</CardTitle>
          <CreditCard className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">4</div>
          <p className="text-muted-foreground text-xs">{formatCurrency(6_240)} total outstanding</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Delivered this month</CardTitle>
          <PackageCheck className="text-success h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">18</div>
          <p className="text-muted-foreground text-xs">98.6% on-time delivery rate</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Credit balance</CardTitle>
          <Wallet className="text-info h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(creditLimit - creditUsed)}</div>
          <Progress value={(creditUsed / creditLimit) * 100} className="mt-2 h-1.5" />
          <p className="text-muted-foreground mt-1 text-xs">
            {formatCurrency(creditUsed)} used of {formatCurrency(creditLimit)} Net-30 limit
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
