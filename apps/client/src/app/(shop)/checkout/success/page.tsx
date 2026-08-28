import Link from 'next/link';
import { CheckCircle2, FileText, LayoutDashboard, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; track?: string }>;
}) {
  const { order, track } = await searchParams;
  const orderNumber = order ?? 'GO-2026-00000';
  const trackingNumber = track || 'Assigned on your order';

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center sm:px-6">
      <span className="bg-success/10 text-success flex h-16 w-16 items-center justify-center rounded-full">
        <CheckCircle2 className="h-9 w-9" />
      </span>
      <h1 className="mt-6 text-3xl font-bold tracking-tight">Order confirmed</h1>
      <p className="text-muted-foreground mt-2">
        Order <span className="text-foreground font-semibold">{orderNumber}</span> is paid. Invoice
        generated. Tracking <span className="font-mono">{trackingNumber}</span>.
      </p>
      <p className="text-muted-foreground mt-2 text-sm">
        We will alert you before delivery and after each of up to 3 attempts.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button asChild size="lg">
          <Link href={`/orders/${orderNumber}`}>
            <Package className="h-4 w-4" /> Track parcel
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/invoices">
            <FileText className="h-4 w-4" /> View invoice
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/dashboard">
            <LayoutDashboard className="h-4 w-4" /> Dashboard
          </Link>
        </Button>
      </div>
      <Link href="/products" className="text-primary mt-6 text-sm hover:underline">
        Continue shopping
      </Link>
    </div>
  );
}
