'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, FileText, PlusCircle, Send, Warehouse, X } from 'lucide-react';
import { KpiCard } from '@/components/shared/kpi-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProcurementBoard } from '@/features/procurement/components/procurement-board';
import { BidComparisonTable } from '@/features/procurement/components/bid-comparison-table';
import {
  NewRequirementForm,
  emptyRequirementForm,
  type RequirementForm,
} from '@/features/procurement/components/new-requirement-form';
import { useCreateRfqRequest, useQuotesByRfq, useTenderRfqs, useTenders } from '@/services/queries';
import { useStaffAuthStore } from '@/store/staff-auth-store';
import { formatCurrency } from '@/lib/utils';
import { Loader } from '@/components/ui/loader';

export function ProcurementPageContent() {
  const user = useStaffAuthStore((state) => state.user);
  const { isLoading } = useTenders();
  const rfqs = useTenderRfqs();
  const quotesByRfq = useQuotesByRfq();
  const createRequest = useCreateRfqRequest();

  const defaultRequester = useMemo(
    () => (user ? `${user.firstName} ${user.lastName}`.trim() : 'Procurement team'),
    [user],
  );

  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [form, setForm] = useState<RequirementForm>(() => emptyRequirementForm(defaultRequester));
  const formPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setForm((current) => ({ ...current, requestedBy: defaultRequester }));
  }, [defaultRequester]);

  useEffect(() => {
    if (!showForm) return;
    formPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [showForm]);

  useEffect(() => {
    if (!successMessage) return;
    const timer = window.setTimeout(() => setSuccessMessage(null), 6000);
    return () => window.clearTimeout(timer);
  }, [successMessage]);

  const totalValue = rfqs.reduce((sum, r) => sum + r.estimatedValue, 0);
  const awaitingApproval = rfqs.filter((r) => r.status === 'approved').length;
  const exampleRfq = rfqs.find((r) => r.id === 'rfq_1') ?? rfqs[0];
  const exampleQuotes = exampleRfq ? (quotesByRfq[exampleRfq.id] ?? []) : [];

  function openForm() {
    setForm(emptyRequirementForm(defaultRequester));
    setFormError(null);
    setShowForm(true);
  }

  async function handleCreate() {
    if (!form.title.trim()) {
      setFormError('Enter a requirement title.');
      return;
    }
    if (!form.requestedBy.trim()) {
      setFormError('Enter who is requesting this.');
      return;
    }
    if (form.quantity <= 0) {
      setFormError('Quantity must be greater than 0.');
      return;
    }
    if (form.estimatedValue <= 0) {
      setFormError('Estimated value must be greater than 0.');
      return;
    }

    setFormError(null);
    try {
      const rfq = await createRequest.mutateAsync({
        title: form.title.trim(),
        requestedBy: form.requestedBy.trim(),
        department: form.department,
        category: form.category,
        quantity: form.quantity,
        estimatedValue: form.estimatedValue,
      });
      setSuccessMessage(`Requirement saved — "${rfq.title}" is now in Requirement Requests.`);
      setHighlightId(rfq.id);
      setShowForm(false);
      setForm(emptyRequirementForm(defaultRequester));
    } catch (createError) {
      setFormError(
        createError instanceof Error ? createError.message : 'Unable to create requirement',
      );
    }
  }

  if (isLoading) {
    return <Loader label="Loading procurement pipeline..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Procurement</h2>
          <p className="text-muted-foreground">
            From requirement request to warehouse receiving — one visual pipeline.
          </p>
        </div>
        <Button type="button" size="lg" onClick={openForm}>
          <PlusCircle className="h-4 w-4" /> New requirement request
        </Button>
      </div>

      {successMessage ? (
        <div className="border-success/30 bg-success/10 text-success flex items-center gap-2 rounded-lg border px-4 py-3 text-sm">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <p>{successMessage}</p>
        </div>
      ) : null}

      {showForm ? (
        <div ref={formPanelRef}>
          <Card className="border-primary/40 shadow-primary/10 shadow-lg">
          <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
            <div>
              <CardTitle>New requirement request</CardTitle>
              <p className="text-muted-foreground mt-1 text-sm">
                Fill in the details below and save to add it to the pipeline.
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Close form"
              onClick={() => setShowForm(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <NewRequirementForm
              form={form}
              formError={formError}
              isSaving={createRequest.isPending}
              onChange={setForm}
              onCancel={() => setShowForm(false)}
              onSubmit={() => void handleCreate()}
            />
          </CardContent>
        </Card>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Active requests"
          value={String(rfqs.length)}
          icon={FileText}
          iconTone="primary"
        />
        <KpiCard
          label="Pipeline value"
          value={formatCurrency(totalValue)}
          icon={Send}
          iconTone="info"
          delta={8.2}
        />
        <KpiCard
          label="Avg. cycle time"
          value="6.4 days"
          delta={-14}
          icon={Warehouse}
          iconTone="success"
        />
        <KpiCard
          label="Awaiting approval"
          value={String(awaitingApproval)}
          icon={FileText}
          iconTone="warning"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Procurement pipeline</CardTitle>
          <p className="text-muted-foreground text-sm">
            New requests start in the first column — Requirement Requests.
          </p>
        </CardHeader>
        <CardContent>
          <ProcurementBoard requests={rfqs} highlightId={highlightId} />
        </CardContent>
      </Card>

      {exampleRfq ? (
        <Card>
          <CardHeader>
            <CardTitle>Quotation comparison — {exampleRfq.title}</CardTitle>
            <p className="text-muted-foreground text-sm">
              {exampleRfq.quantity} units requested by {exampleRfq.requestedBy} (
              {exampleRfq.department})
            </p>
          </CardHeader>
          <CardContent>
            <BidComparisonTable bids={exampleQuotes} />
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
