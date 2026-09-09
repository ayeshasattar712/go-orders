'use client';

import { CheckCircle2, Landmark, Smartphone, ScrollText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { PaymentMethod } from '@/features/checkout/types';

const methods: {
  id: PaymentMethod;
  label: string;
  description: string;
  icon: typeof Landmark;
}[] = [
  {
    id: 'bank-account',
    label: 'Bank account transfer',
    description: 'Pay into GoOrder HBL account and keep the reference number',
    icon: Landmark,
  },
  {
    id: 'online-transfer',
    label: 'Online transfer',
    description: 'JazzCash, EasyPaisa, Raast, or internet banking',
    icon: Smartphone,
  },
  {
    id: 'cheque',
    label: 'Pay via cheque',
    description: 'Issue a cheque in favour of GoOrder and enter the cheque number',
    icon: ScrollText,
  },
];

interface PaymentStepProps {
  selected: PaymentMethod;
  transferReference: string;
  onSelect: (method: PaymentMethod) => void;
  onTransferReference: (value: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export function PaymentStep({
  selected,
  transferReference,
  onSelect,
  onTransferReference,
  onNext,
  onBack,
}: PaymentStepProps) {
  const isCheque = selected === 'cheque';

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Payment method</h2>
      <p className="text-muted-foreground text-sm">
        Pay in Pakistani rupees (PKR) by bank deposit, online transfer, or cheque. Your invoice and
        tracking number are created as soon as you place the order.
      </p>

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
              <span className="bg-accent-brand/15 text-accent-brand-foreground flex h-10 w-10 items-center justify-center rounded-lg">
                <method.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="font-medium">{method.label}</p>
                <p className="text-muted-foreground text-sm">{method.description}</p>
              </div>
            </div>
            {selected === method.id ? <CheckCircle2 className="text-primary h-5 w-5" /> : null}
          </button>
        ))}
      </div>

      <div className="bg-muted/50 space-y-3 rounded-xl border p-4 text-sm">
        {isCheque ? (
          <>
            <p className="font-semibold">Cheque payment</p>
            <p>Payee: GoOrder Marketplace (Pvt) Ltd</p>
            <p>Bank: Any scheduled bank in Pakistan</p>
            <p>Write the order total in PKR and keep a copy of the cheque.</p>
            <div className="space-y-2 pt-2">
              <Label htmlFor="cheque-number">Cheque number</Label>
              <Input
                id="cheque-number"
                value={transferReference}
                onChange={(event) => onTransferReference(event.target.value)}
                placeholder="e.g. 45218976"
              />
            </div>
          </>
        ) : (
          <>
            <p className="font-semibold">GoOrder receiving account</p>
            <p>Bank: Habib Bank Limited</p>
            <p>Title: GoOrder Marketplace (Pvt) Ltd</p>
            <p className="font-mono">PK12 HABB 0000 1234 5678 9000</p>
            <div className="space-y-2 pt-2">
              <Label htmlFor="transfer-ref">Your transfer / transaction ID</Label>
              <Input
                id="transfer-ref"
                value={transferReference}
                onChange={(event) => onTransferReference(event.target.value)}
                placeholder="e.g. TXN-88921 or last 6 digits"
              />
            </div>
          </>
        )}
      </div>

      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext} disabled={isCheque && !transferReference.trim()}>
          Review order
        </Button>
      </div>
    </div>
  );
}
