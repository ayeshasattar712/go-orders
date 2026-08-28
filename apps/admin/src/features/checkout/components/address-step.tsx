'use client';

import { useState } from 'react';
import { CheckCircle2, MapPin, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { savedAddresses, type CheckoutAddress } from '@/features/checkout/types';

interface AddressStepProps {
  selectedId: string;
  onSelect: (address: CheckoutAddress) => void;
  onNext: () => void;
}

export function AddressStep({ selectedId, onSelect, onNext }: AddressStepProps) {
  const [addingNew, setAddingNew] = useState(false);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Select delivery address</h2>

      <div className="grid gap-3 sm:grid-cols-2">
        {savedAddresses.map((address) => (
          <button
            key={address.id}
            type="button"
            onClick={() => onSelect(address)}
            className={cn(
              'hover:border-primary relative rounded-xl border p-4 text-left transition-colors',
              selectedId === address.id && 'border-primary bg-primary/5',
            )}
          >
            {selectedId === address.id ? (
              <CheckCircle2 className="text-primary absolute top-3 right-3 h-5 w-5" />
            ) : null}
            <div className="flex items-center gap-2 text-sm font-semibold">
              <MapPin className="text-muted-foreground h-4 w-4" />
              {address.label}
              {address.isDefault ? (
                <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-[10px] font-medium">
                  Default
                </span>
              ) : null}
            </div>
            <p className="text-muted-foreground mt-2 text-sm">
              {address.fullName}
              {address.company ? `, ${address.company}` : ''}
              <br />
              {address.line1}
              {address.line2 ? `, ${address.line2}` : ''}
              <br />
              {address.city}, {address.state} {address.zip}
            </p>
          </button>
        ))}

        <button
          type="button"
          onClick={() => setAddingNew(true)}
          className="text-muted-foreground hover:border-primary hover:text-primary flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed p-4 text-sm"
        >
          <Plus className="h-5 w-5" />
          Add new address
        </button>
      </div>

      {addingNew ? (
        <p className="bg-muted/60 text-muted-foreground rounded-lg p-3 text-xs">
          New address form would appear here in a full implementation — connect to your address book
          API.
        </p>
      ) : null}

      <div className="flex justify-end pt-2">
        <Button onClick={onNext} disabled={!selectedId}>
          Continue to delivery
        </Button>
      </div>
    </div>
  );
}
