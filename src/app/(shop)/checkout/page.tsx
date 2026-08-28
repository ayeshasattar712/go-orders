'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { CheckoutStepper } from '@/features/checkout/components/checkout-stepper';
import { AddressStep } from '@/features/checkout/components/address-step';
import { DeliveryStep } from '@/features/checkout/components/delivery-step';
import { PaymentStep } from '@/features/checkout/components/payment-step';
import { ReviewStep } from '@/features/checkout/components/review-step';
import {
  savedAddresses,
  type CheckoutAddress,
  type DeliveryOption,
  type PaymentMethod,
} from '@/features/checkout/types';
import { useCartSummary, useCartStore } from '@/store/cart-store';
import { ordersService } from '@/services/api';
import { vendors } from '@/lib/mock-data';
import { formatCurrency } from '@/lib/utils';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const steps = [
  { id: 'address', label: 'Address' },
  { id: 'delivery', label: 'Delivery' },
  { id: 'payment', label: 'Payment' },
  { id: 'review', label: 'Review' },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal } = useCartSummary();
  const clearCart = useCartStore((state) => state.clearCart);

  const [stepIndex, setStepIndex] = useState(0);
  const [address, setAddress] = useState<CheckoutAddress>(
    savedAddresses.find((a) => a.isDefault) ?? savedAddresses[0]!,
  );
  const [delivery, setDelivery] = useState<DeliveryOption>('standard');
  const [payment, setPayment] = useState<PaymentMethod>('card');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <EmptyState
          title="Your cart is empty"
          description="Add products to your cart before checking out."
          action={
            <Button asChild>
              <Link href="/products">Browse products</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const shipping = delivery === 'express' ? 49 : delivery === 'scheduled' ? 19 : 0;
  const tax = subtotal * 0.0825;
  const total = subtotal + shipping + tax;

  async function handlePlaceOrder() {
    setIsSubmitting(true);
    setOrderError(null);
    try {
      const vendorNames = Array.from(
        new Set(
          items.map(
            (item) => vendors.find((v) => v.id === item.vendorId)?.name ?? 'GoOrder Marketplace',
          ),
        ),
      );
      const order = await ordersService.create({
        items: items.map((item) => ({
          productId: item.productId,
          name: item.name,
          image: item.image,
          quantity: item.quantity,
          price: item.price,
        })),
        vendorName: vendorNames.length === 1 ? vendorNames[0]! : 'Multiple vendors',
        shipping,
        tax,
      });
      clearCart();
      router.push(`/checkout/success?order=${order.orderNumber}`);
    } catch (error) {
      setOrderError(error instanceof Error ? error.message : 'Unable to place order');
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Checkout</h1>

      <div className="mb-8">
        <CheckoutStepper steps={steps} activeIndex={stepIndex} />
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl border p-6">
          {stepIndex === 0 ? (
            <AddressStep
              selectedId={address.id}
              onSelect={setAddress}
              onNext={() => setStepIndex(1)}
            />
          ) : null}
          {stepIndex === 1 ? (
            <DeliveryStep
              selected={delivery}
              onSelect={setDelivery}
              onNext={() => setStepIndex(2)}
              onBack={() => setStepIndex(0)}
            />
          ) : null}
          {stepIndex === 2 ? (
            <PaymentStep
              selected={payment}
              onSelect={setPayment}
              onNext={() => setStepIndex(3)}
              onBack={() => setStepIndex(1)}
            />
          ) : null}
          {stepIndex === 3 ? (
            <>
              {orderError ? (
                <p className="border-destructive/30 bg-destructive/5 text-destructive mb-4 rounded-lg border p-3 text-sm">
                  {orderError}
                </p>
              ) : null}
              <ReviewStep
                address={address}
                delivery={delivery}
                payment={payment}
                onBack={() => setStepIndex(2)}
                onPlaceOrder={handlePlaceOrder}
                isSubmitting={isSubmitting}
              />
            </>
          ) : null}
        </div>

        <div className="h-fit rounded-2xl border p-6">
          <h2 className="mb-4 font-semibold">Order summary</h2>
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.productId} className="flex items-center gap-3">
                <div className="bg-muted relative h-10 w-10 shrink-0 overflow-hidden rounded-lg">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                </div>
                <p className="flex-1 truncate text-sm">{item.name}</p>
                <p className="text-muted-foreground text-sm">x{item.quantity}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-1.5 border-t pt-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>{shipping === 0 ? 'Free' : formatCurrency(shipping)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax</span>
              <span>{formatCurrency(tax)}</span>
            </div>
            <div className="flex justify-between border-t pt-2 text-base font-bold">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
