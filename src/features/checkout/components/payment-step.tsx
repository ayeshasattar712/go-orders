'use client';

import { Banknote, CheckCircle2, CreditCard, Landmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { PaymentMethod } from '@/features/checkout/types';

const methods: {
  id: PaymentMethod;
  label: string;
  description: string;
  icon: typeof CreditCard;
}[] = [
  {
    id: 'card',
    label: 'Credit or debit card',
    description: 'Visa, Mastercard, Amex',
    icon: CreditCard,
  },
  {
    id: 'ach',
    label: 'ACH bank transfer',
    description: 'Direct from your business account',
    icon: Landmark,
  },
  {
    id: 'credit-terms',
    label: 'Net-30 credit terms',
    description: 'For approved business accounts',
    icon: Banknote,
  },
];

interface PaymentStepProps {
  selected: PaymentMethod;
  onSelect: (method: PaymentMethod) => void;
  onNext: () => void;
  onBack: () => void;
}

export function PaymentStep({ selected, onSelect, onNext, onBack }: PaymentStepProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Payment method</h2>

      <div className="space-y-3">
        {methods.map((method) => (
          <button
            key={method.id}
            type="button"
            onClick={() => onSelect(method.id)}
            className={cn(
              'hover:border-primary flex w-full items-center justify-between rounded-xl border p-4 text-left transition-colors',
              selected === method.id && 'border-primary bg-primary/5',
            )}
          >
            <div className="flex items-center gap-3">
              <span className="bg-muted text-primary flex h-10 w-10 items-center justify-center rounded-lg">
                <method.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="flex items-center gap-2 font-medium">
                  {method.label}
                  {method.id === 'credit-terms' ? (
                    <Badge variant="success">Pre-approved</Badge>
                  ) : null}
                </p>
                <p className="text-muted-foreground text-sm">{method.description}</p>
              </div>
            </div>
            {selected === method.id ? <CheckCircle2 className="text-primary h-5 w-5" /> : null}
          </button>
        ))}
      </div>

      {selected === 'card' ? (
        <div className="grid gap-4 rounded-xl border p-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="card-number">Card number</Label>
            <Input id="card-number" placeholder="4242 4242 4242 4242" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="card-expiry">Expiry date</Label>
            <Input id="card-expiry" placeholder="MM/YY" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="card-cvc">CVC</Label>
            <Input id="card-cvc" placeholder="123" />
          </div>
        </div>
      ) : null}

      {selected === 'credit-terms' ? (
        <div className="border-success/30 bg-success/5 text-success rounded-xl border p-4 text-sm">
          Your business qualifies for Net-30 terms with a credit limit of $50,000. Invoice will be
          issued upon delivery confirmation.
        </div>
      ) : null}

      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext}>Review order</Button>
      </div>
    </div>
  );
}
