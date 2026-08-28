import Link from 'next/link';
import { CheckCircle2, FileText, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;
  const orderNumber = order ?? 'GO-2026-00000';

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center sm:px-6">
      <span className="bg-success/10 text-success flex h-16 w-16 items-center justify-center rounded-full">
        <CheckCircle2 className="h-9 w-9" />
      </span>
      <h1 className="mt-6 text-3xl font-bold tracking-tight">Order confirmed</h1>
      <p className="text-muted-foreground mt-2">
        Thank you! Your order <span className="text-foreground font-semibold">{orderNumber}</span>{' '}
        has been placed successfully. A confirmation has been sent to your email.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button asChild size="lg">
          <Link href="/orders">
            <FileText className="h-4 w-4" /> View order status
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/dashboard">
            <LayoutDashboard className="h-4 w-4" /> Go to dashboard
          </Link>
        </Button>
      </div>

      <Link href="/products" className="text-primary mt-6 text-sm hover:underline">
        Continue shopping
      </Link>
    </div>
  );
}
