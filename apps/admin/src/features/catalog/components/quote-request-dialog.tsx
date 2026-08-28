'use client';

import { useState } from 'react';
import { FileText } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useGuardedAction } from '@/hooks/use-guarded-action';
import type { Product } from '@/types/catalog';

export function QuoteRequestDialog({ product }: { product: Product }) {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [quantity, setQuantity] = useState(product.minOrderQty * 10);
  const guard = useGuardedAction();

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="lg"
        className="w-full"
        onClick={() =>
          guard(() => setOpen(true), 'Sign in to request a bulk quotation from vendors.')
        }
      >
        <FileText className="h-4 w-4" /> Request quotation
      </Button>

      <Modal
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setSubmitted(false);
        }}
        title="Request a quotation"
        description={`Get custom bulk pricing for ${product.name} from ${product.vendorId}.`}
        footer={
          submitted ? (
            <Button onClick={() => setOpen(false)}>Done</Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setSubmitted(true)}>Submit request</Button>
            </>
          )
        }
      >
        {submitted ? (
          <div className="bg-success/10 text-success rounded-lg p-4 text-sm">
            Your quotation request has been sent to the vendor. Expect a response within{' '}
            {product.vendorId ? '24 hours' : 'one business day'}.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="quote-quantity">Estimated quantity</Label>
              <Input
                id="quote-quantity"
                type="number"
                min={product.minOrderQty}
                value={quantity}
                onChange={(event) => setQuantity(Number(event.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quote-notes">Additional notes (optional)</Label>
              <Input
                id="quote-notes"
                placeholder="Delivery timeline, customization, contract terms..."
              />
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
