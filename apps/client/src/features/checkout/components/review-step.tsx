'use client';

import Image from 'next/image';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { useCartSummary } from '@/store/cart-store';
import type { CheckoutAddress, DeliveryOption, PaymentMethod } from '@/features/checkout/types';
import { shippingFee } from '@/features/checkout/types';

const deliveryLabels: Record<DeliveryOption, string> = {
  hour: 'Deliver within 1 hour',
  standard: 'Standard delivery (3-5 business days)',
  express: 'Express delivery (1-2 business days)',
  scheduled: 'Scheduled delivery',
};

const paymentLabels: Record<PaymentMethod, string> = {
  'bank-account': 'Bank account transfer',
  'online-transfer': 'Online transfer',
};

interface ReviewStepProps {
  address: CheckoutAddress;
  delivery: DeliveryOption;
  payment: PaymentMethod;
  onBack: () => void;
  onPlaceOrder: () => void;
  isSubmitting: boolean;
}

export function ReviewStep({
  address,
  delivery,
  payment,
  onBack,
  onPlaceOrder,
  isSubmitting,
}: ReviewStepProps) {
  const { items, subtotal } = useCartSummary();
  const tax = subtotal * 0.0825;
  const shipping = shippingFee(delivery);
  const total = subtotal + tax + shipping;

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold">Review your order</h2>

      <div className="rounded-xl border p-4">
        <h3 className="text-muted-foreground text-sm font-semibold">Items ({items.length})</h3>
        <div className="mt-3 space-y-3">
          {items.map((item) => (
            <div key={item.productId} className="flex items-center gap-3">
              <div className="bg-muted relative h-12 w-12 shrink-0 overflow-hidden rounded-lg">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              </div>
              <div className="flex-1 text-sm">
                <p className="font-medium">{item.name}</p>
                <p className="text-muted-foreground">Qty {item.quantity}</p>
              </div>
              <p className="text-sm font-medium">{formatCurrency(item.price * item.quantity)}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border p-4 text-sm">
          <p className="text-muted-foreground font-semibold">Delivery address</p>
          <p className="mt-1">{address.fullName}</p>
          <p className="text-muted-foreground">
            {address.line1}, {address.city}, {address.state} {address.zip}
          </p>
        </div>
        <div className="rounded-xl border p-4 text-sm">
          <p className="text-muted-foreground font-semibold">Delivery method</p>
          <p className="mt-1">{deliveryLabels[delivery]}</p>
        </div>
        <div className="rounded-xl border p-4 text-sm">
          <p className="text-muted-foreground font-semibold">Payment method</p>
          <p className="mt-1">{paymentLabels[payment]}</p>
        </div>
      </div>

      <div className="space-y-2 rounded-xl border p-4 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Shipping</span>
          <span>{shipping === 0 ? 'Free' : formatCurrency(shipping)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Estimated tax</span>
          <span>{formatCurrency(tax)}</span>
        </div>
        <div className="flex justify-between border-t pt-2 text-base font-bold">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>

      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={onBack} disabled={isSubmitting}>
          Back
        </Button>
        <Button onClick={onPlaceOrder} disabled={isSubmitting} size="lg">
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {isSubmitting ? 'Placing order...' : `Place order · ${formatCurrency(total)}`}
        </Button>
      </div>
    </div>
  );
}
