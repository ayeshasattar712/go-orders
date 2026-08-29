'use client';

import { motion } from 'framer-motion';
import { Building2, CalendarClock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { RfqRequest } from '@/types/enterprise';

const columns: { status: RfqRequest['status']; label: string; tone: string }[] = [
  { status: 'draft', label: 'Requirement Requests', tone: 'bg-muted-foreground/40' },
  { status: 'rfq-sent', label: 'RFQs Sent', tone: 'bg-info' },
  { status: 'quotes-received', label: 'Quotation Comparison', tone: 'bg-warning' },
  { status: 'vendor-selected', label: 'Vendor Selected', tone: 'bg-accent-brand' },
  { status: 'po-issued', label: 'Purchase Orders', tone: 'bg-primary' },
  { status: 'approved', label: 'Approvals', tone: 'bg-info' },
  { status: 'receiving', label: 'Warehouse Receiving', tone: 'bg-success' },
  { status: 'completed', label: 'Completed', tone: 'bg-success' },
];

export function ProcurementBoard({
  requests,
  highlightId,
}: {
  requests: RfqRequest[];
  highlightId?: string | null;
}) {
  return (
    <div className="flex scrollbar-none gap-4 overflow-x-auto pb-4">
      {columns.map((column, colIndex) => {
        const items = requests.filter((request) => request.status === column.status);
        return (
          <div key={column.status} className="w-72 shrink-0">
            <div className="mb-3 flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${column.tone}`} />
              <h3 className="text-sm font-semibold">{column.label}</h3>
              <span className="bg-muted text-muted-foreground ml-auto rounded-full px-2 py-0.5 text-xs">
                {items.length}
              </span>
            </div>

            <div className="space-y-3">
              {items.map((request, index) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: (colIndex * items.length + index) * 0.03 }}
                  className={`card-hover bg-card rounded-xl border p-4 ${highlightId === request.id ? 'ring-primary ring-2' : ''}`}
                >
                  <p className="text-sm leading-snug font-medium">{request.title}</p>
                  <div className="text-muted-foreground mt-2 flex items-center gap-1.5 text-xs">
                    <Building2 className="h-3.5 w-3.5" /> {request.department}
                  </div>
                  <div className="text-muted-foreground mt-1 flex items-center gap-1.5 text-xs">
                    <CalendarClock className="h-3.5 w-3.5" /> {formatDate(request.createdAt)}
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <Badge variant="secondary" className="text-[10px]">
                      {request.category}
                    </Badge>
                    <span className="text-sm font-semibold">
                      {formatCurrency(request.estimatedValue)}
                    </span>
                  </div>
                </motion.div>
              ))}
              {items.length === 0 ? (
                <div className="text-muted-foreground rounded-xl border border-dashed p-4 text-center text-xs">
                  No items
                </div>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
