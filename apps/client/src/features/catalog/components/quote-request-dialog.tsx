'use client';

import { useState } from 'react';
import { FileText } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useGuardedAction } from '@/hooks/use-guarded-action';
import { useCreateQuotation } from '@/services/queries';
import type { Product } from '@/types/catalog';

export function QuoteRequestDialog({ product }: { product: Product }) {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [quantity, setQuantity] = useState(product.minOrderQty * 10);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const guard = useGuardedAction();
  const createQuotation = useCreateQuotation();

  async function handleSubmit() {
    setError(null);
    try {
      await createQuotation.mutateAsync({
        productId: product.id,
        productName: product.name,
        quantity,
        unit: product.unit,
        notes: notes.trim() || undefined,
        estimatedTotal: product.price * quantity,
        vendorId: product.vendorId,
      });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send your quotation request.');
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="lg"
        className="w-full"
        onClick={() =>
          guard(() => setOpen(true), 'Sign in to request a bulk quotation from GoOrder.')
        }
      >
        <FileText className="h-4 w-4" /> Request quotation
      </Button>

      <Modal
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) {
            setSubmitted(false);
            setError(null);
            setNotes('');
          }
        }}
        title="Request a quotation"
        description={`Get custom bulk pricing for ${product.name} from GoOrder.`}
        footer={
          submitted ? (
            <Button onClick={() => setOpen(false)}>Done</Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button disabled={createQuotation.isPending} onClick={() => void handleSubmit()}>
                {createQuotation.isPending ? 'Sending...' : 'Submit request'}
              </Button>
            </>
          )
        }
      >
        {submitted ? (
          <div className="bg-success/10 text-success rounded-lg p-4 text-sm">
            Your quotation request has been sent to GoOrder. Expect a response within 24 hours.
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
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
              />
            </div>
            {error ? <p className="text-destructive text-sm">{error}</p> : null}
          </div>
        )}
      </Modal>
    </>
  );
}
