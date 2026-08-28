import type {
  Order as PrismaOrder,
  OrderItem as PrismaOrderItem,
  OrderStatus as PrismaOrderStatus,
  OrderTimelineStep as PrismaTimelineStep,
  User as PrismaUser,
} from '@prisma/client';
import type { Order, OrderStatus } from '@/types/catalog';

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

type PrismaOrderWithRelations = PrismaOrder & {
  items: PrismaOrderItem[];
  timeline: PrismaTimelineStep[];
};

/** Converts a Prisma Order (enum statuses, Date objects) into the plain shape the existing UI (OrderStatusBadge, OrderTimeline, etc.) already expects. */
export function serializeOrder(order: PrismaOrderWithRelations): Order {
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

export interface AdminOrder extends Order {
  customer: { id: string; name: string; email: string } | null;
}

type PrismaOrderWithCustomer = PrismaOrderWithRelations & { user: PrismaUser | null };

/** Same as serializeOrder, plus the customer identity staff need to process the order. */
export function serializeAdminOrder(order: PrismaOrderWithCustomer): AdminOrder {
  return {
    ...serializeOrder(order),
    customer: order.user
      ? {
          id: order.user.id,
          name: `${order.user.firstName} ${order.user.lastName}`,
          email: order.user.email,
        }
      : null,
  };
}

/** Timeline steps checkout always creates, in fulfillment order. */
export const FULFILLMENT_TIMELINE_SEQUENCE: OrderStatus[] = [
  'confirmed',
  'processing',
  'shipped',
  'delivered',
];
