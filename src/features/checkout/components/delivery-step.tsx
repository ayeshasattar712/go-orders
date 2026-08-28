'use client';

import { CalendarClock, CheckCircle2, Truck, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn, formatCurrency } from '@/lib/utils';
import type { DeliveryOption } from '@/features/checkout/types';

const options: {
  id: DeliveryOption;
  label: string;
  description: string;
  price: number;
  icon: typeof Truck;
}[] = [
  {
    id: 'standard',
    label: 'Standard delivery',
    description: '3-5 business days',
    price: 0,
    icon: Truck,
  },
  {
    id: 'express',
    label: 'Express delivery',
    description: '1-2 business days',
    price: 49,
    icon: Zap,
  },
  {
    id: 'scheduled',
    label: 'Scheduled delivery',
    description: 'Choose a specific date and time window',
    price: 19,
    icon: CalendarClock,
  },
];

interface DeliveryStepProps {
  selected: DeliveryOption;
  onSelect: (option: DeliveryOption) => void;
  onNext: () => void;
  onBack: () => void;
}

export function DeliveryStep({ selected, onSelect, onNext, onBack }: DeliveryStepProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Choose delivery speed</h2>

      <div className="space-y-3">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onSelect(option.id)}
            className={cn(
              'hover:border-primary flex w-full items-center justify-between rounded-xl border p-4 text-left transition-colors',
              selected === option.id && 'border-primary bg-primary/5',
            )}
          >
            <div className="flex items-center gap-3">
              <span className="bg-muted text-primary flex h-10 w-10 items-center justify-center rounded-lg">
                <option.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="font-medium">{option.label}</p>
                <p className="text-muted-foreground text-sm">{option.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-semibold">
                {option.price === 0 ? 'Free' : formatCurrency(option.price)}
              </span>
              {selected === option.id ? <CheckCircle2 className="text-primary h-5 w-5" /> : null}
            </div>
          </button>
        ))}
      </div>

      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext}>Continue to payment</Button>
      </div>
    </div>
  );
}
