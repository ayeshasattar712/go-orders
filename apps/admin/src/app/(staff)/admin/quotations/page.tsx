'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EmptyState } from '@/components/ui/empty-state';
import { Loader } from '@/components/ui/loader';
import { useQuotations, useUpdateQuotation } from '@/services/queries';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { QuotationStatus } from '@/types/admin';

const STATUS_FILTERS: { value: QuotationStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'requested', label: 'Requested' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

const statusConfig: Record<
  QuotationStatus,
  { label: string; variant: 'success' | 'warning' | 'destructive' }
> = {
  approved: { label: 'Approved', variant: 'success' },
  requested: { label: 'Requested', variant: 'warning' },
  rejected: { label: 'Rejected', variant: 'destructive' },
};

export default function AdminQuotationsPage() {
  const { data: quotations, isPending, isError } = useQuotations();
  const updateQuotation = useUpdateQuotation();
  const [statusFilter, setStatusFilter] = useState<QuotationStatus | 'all'>('all');

  const filtered = useMemo(() => {
    if (!quotations) return [];
    return statusFilter === 'all'
      ? quotations
      : quotations.filter((quotation) => quotation.status === statusFilter);
  }, [quotations, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Quotations</h2>
          <p className="text-muted-foreground">
            Review bulk pricing requests from customers. These come to GoOrder, not to vendors.
          </p>
        </div>
        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as QuotationStatus | 'all')}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_FILTERS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-4 w-4" /> All requests ({filtered.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isPending ? (
            <Loader label="Loading quotations..." />
          ) : isError ? (
            <EmptyState title="Couldn't load quotations" description="Please try again." />
          ) : filtered.length === 0 ? (
            <EmptyState
              title="No quotation requests"
              description="When a customer requests bulk pricing, it will show up here."
            />
          ) : (
            <div className="overflow-hidden rounded-xl border">
              {filtered.map((quotation) => (
                <div
                  key={quotation.id}
                  className="flex flex-col gap-3 border-b p-4 last:border-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{quotation.productName}</p>
                      <Badge variant={statusConfig[quotation.status].variant}>
                        {statusConfig[quotation.status].label}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      {quotation.quotationNumber} · {quotation.quantity} {quotation.unit}
                      {quotation.clientName ? (
                        <>
                          {' '}
                          ·{' '}
                          <Link
                            href={`/admin/clients/${quotation.clientId}`}
                            className="hover:text-primary hover:underline"
                          >
                            {quotation.clientName}
                          </Link>
                        </>
                      ) : null}
                    </p>
                    {quotation.notes ? (
                      <p className="text-muted-foreground mt-1 text-sm">{quotation.notes}</p>
                    ) : null}
                    <p className="text-muted-foreground text-xs">
                      Requested {formatDate(quotation.requestedAt)}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
                    <span className="font-semibold">{formatCurrency(quotation.estimatedTotal)}</span>
                    {quotation.status === 'requested' ? (
                      <>
                        <Button
                          size="sm"
                          disabled={updateQuotation.isPending}
                          onClick={() =>
                            updateQuotation.mutate({ id: quotation.id, status: 'approved' })
                          }
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={updateQuotation.isPending}
                          onClick={() =>
                            updateQuotation.mutate({ id: quotation.id, status: 'rejected' })
                          }
                        >
                          Decline
                        </Button>
                      </>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
