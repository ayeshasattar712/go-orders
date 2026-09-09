import type { Quotation as PrismaQuotation } from '@prisma/client';
import type { Quotation } from '@/types/admin';

const STATUS: Record<PrismaQuotation['status'], Quotation['status']> = {
  REQUESTED: 'requested',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

export function serializeQuotation(quotation: PrismaQuotation): Quotation {
  return {
    id: quotation.id,
    quotationNumber: quotation.quotationNumber,
    clientId: quotation.clientId,
    productName: quotation.productName,
    quantity: quotation.quantity,
    unit: quotation.unit,
    notes: quotation.notes ?? undefined,
    estimatedTotal: quotation.estimatedTotal,
    status: STATUS[quotation.status],
    requestedAt: quotation.requestedAt.toISOString(),
    respondedAt: quotation.respondedAt ? quotation.respondedAt.toISOString() : null,
    vendorName: quotation.vendorName,
  };
}

export function generateQuotationNumber() {
  const year = new Date().getFullYear();
  const suffix = Math.floor(10_000 + Math.random() * 89_999);
  return `QT-${year}-${suffix}`;
}
