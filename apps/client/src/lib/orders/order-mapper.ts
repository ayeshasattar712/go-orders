import type {
  Order as PrismaOrder,
  OrderItem as PrismaOrderItem,
  OrderStatus as PrismaOrderStatus,
  OrderTimelineStep as PrismaTimelineStep,
  Payment as PrismaPayment,
  DeliveryJob as PrismaDeliveryJob,
  DeliveryAttempt as PrismaDeliveryAttempt,
  CheckoutPaymentMethod,
  PaymentStatus as PrismaPaymentStatus,
  DeliveryAttemptOutcome,
} from '@prisma/client';
import type { Order, OrderStatus } from '@/types/catalog';
import { prisma } from '@/lib/prisma';

export const ORDER_STATUS_TO_STRING: Record<PrismaOrderStatus, OrderStatus> = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  PACKED: 'packed',
  SHIPPED: 'shipped',
  OUT_FOR_DELIVERY: 'out-for-delivery',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

export const ORDER_STATUS_FROM_STRING: Record<OrderStatus, PrismaOrderStatus> = {
  pending: 'PENDING',
  confirmed: 'CONFIRMED',
  processing: 'PROCESSING',
  packed: 'PACKED',
  shipped: 'SHIPPED',
  'out-for-delivery': 'OUT_FOR_DELIVERY',
  delivered: 'DELIVERED',
  cancelled: 'CANCELLED',
};

const PAYMENT_METHOD_TO_STRING: Record<CheckoutPaymentMethod, 'bank-account' | 'online-transfer'> =
  {
    BANK_ACCOUNT: 'bank-account',
    ONLINE_TRANSFER: 'online-transfer',
  };

const PAYMENT_STATUS_TO_STRING: Record<
  PrismaPaymentStatus,
  'pending' | 'awaiting-transfer' | 'confirmed'
> = {
  PENDING: 'pending',
  AWAITING_TRANSFER: 'awaiting-transfer',
  CONFIRMED: 'confirmed',
};

const ATTEMPT_OUTCOME_TO_STRING: Record<DeliveryAttemptOutcome, 'success' | 'failed'> = {
  SUCCESS: 'success',
  FAILED: 'failed',
};

type PrismaOrderWithRelations = PrismaOrder & {
  items: PrismaOrderItem[];
  timeline: PrismaTimelineStep[];
  payment?: PrismaPayment | null;
};

/** Converts a Prisma Order into the shape the shop UI expects. */
export function serializeOrder(
  order: PrismaOrderWithRelations,
  delivery?: (PrismaDeliveryJob & { attempts: PrismaDeliveryAttempt[] }) | null,
): Order {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    date: order.date.toISOString(),
    status: ORDER_STATUS_TO_STRING[order.status],
    total: order.total,
    itemCount: order.itemCount,
    eta: order.eta,
    vendorName: order.vendorName,
    trackingNumber: order.trackingNumber,
    carrier: order.carrier,
    shippingName: order.shippingName ?? undefined,
    shippingLine1: order.shippingLine1 ?? undefined,
    shippingCity: order.shippingCity ?? undefined,
    paymentMethod: order.paymentMethod ? PAYMENT_METHOD_TO_STRING[order.paymentMethod] : undefined,
    payment: order.payment
      ? {
          method: PAYMENT_METHOD_TO_STRING[order.payment.method],
          status: PAYMENT_STATUS_TO_STRING[order.payment.status],
          amount: order.payment.amount,
          reference: order.payment.reference,
          bankName: order.payment.bankName ?? undefined,
          accountTitle: order.payment.accountTitle ?? undefined,
          accountNumber: order.payment.accountNumber ?? undefined,
          transferReference: order.payment.transferReference ?? undefined,
        }
      : undefined,
    delivery: delivery
      ? {
          status: delivery.status.toLowerCase().replaceAll('_', '-'),
          eta: delivery.eta,
          trackingNumber: delivery.trackingNumber ?? order.trackingNumber,
          destination: delivery.destination,
          maxAttempts: delivery.maxAttempts,
          attempts: delivery.attempts.map((attempt) => ({
            attemptNumber: attempt.attemptNumber,
            outcome: ATTEMPT_OUTCOME_TO_STRING[attempt.outcome],
            reason: attempt.reason ?? undefined,
            attemptedAt: attempt.attemptedAt.toISOString(),
            nextAttemptAt: attempt.nextAttemptAt ? attempt.nextAttemptAt.toISOString() : undefined,
          })),
        }
      : undefined,
    items: order.items.map((item) => ({
      name: item.name,
      image: item.image,
      quantity: item.quantity,
      price: item.price,
    })),
    timeline: order.timeline.map((step) => ({
      status: ORDER_STATUS_TO_STRING[step.status],
      label: step.label,
      timestamp: step.timestamp ? step.timestamp.toISOString() : null,
      description: step.description,
    })),
  };
}

export async function loadDeliveriesByOrderNumbers(orderNumbers: string[]) {
  if (orderNumbers.length === 0) {
    return new Map<string, PrismaDeliveryJob & { attempts: PrismaDeliveryAttempt[] }>();
  }

  try {
    const jobs = await prisma.deliveryJob.findMany({
      where: { orderNumber: { in: orderNumbers } },
      include: { attempts: { orderBy: { attemptNumber: 'asc' as const } } },
    });
    return new Map(jobs.map((job) => [job.orderNumber, job]));
  } catch {
    return new Map<string, PrismaDeliveryJob & { attempts: PrismaDeliveryAttempt[] }>();
  }
}
