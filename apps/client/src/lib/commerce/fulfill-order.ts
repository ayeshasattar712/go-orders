import { prisma } from '@/lib/prisma';
import type { CheckoutPaymentMethod } from '@prisma/client';

export async function ensureCustomerClient(params: {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
}) {
  const existing = await prisma.client.findFirst({
    where: { OR: [{ userId: params.userId }, { email: params.email.toLowerCase() }] },
  });
  if (existing) {
    if (!existing.userId) {
      return prisma.client.update({
        where: { id: existing.id },
        data: { userId: params.userId },
      });
    }
    return existing;
  }

  const name = `${params.firstName} ${params.lastName}`.trim();
  return prisma.client.create({
    data: {
      userId: params.userId,
      companyName: `${name}'s account`,
      contactName: name || params.email,
      email: params.email.toLowerCase(),
      phone: '—',
      address: '—',
      joinedAt: new Date(),
    },
  });
}

export function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const suffix = Math.floor(10_000 + Math.random() * 89_999);
  return `GO-${year}-${suffix}`;
}

export function generateTrackingNumber(): string {
  return `GO-TRK-${Math.floor(10_000_000 + Math.random() * 89_999_999)}`;
}

export function generateInvoiceNumber(): string {
  return `INV-${new Date().getFullYear()}-${Math.floor(10_000 + Math.random() * 89_999)}`;
}

export function generatePaymentReference(): string {
  return `GO-PAY-${Math.floor(100_000 + Math.random() * 899_999)}`;
}

export function etaForDelivery(option: 'hour' | 'standard' | 'express' | 'scheduled'): string {
  if (option === 'hour') return 'Within 60 minutes · rider on the way';
  if (option === 'express') return '1-2 business days · 9 AM – 8 PM';
  if (option === 'scheduled') return 'Scheduled window · 10 AM – 2 PM';
  return '3-5 business days · 9 AM – 6 PM';
}

export const GOORDER_BANK = {
  bankName: 'Habib Bank Limited',
  accountTitle: 'GoOrder Marketplace (Pvt) Ltd',
  accountNumber: 'PK12 HABB 0000 1234 5678 9000',
};

export async function notifyCustomer(params: {
  clientId?: string | null;
  type: 'INVOICE' | 'PAYMENT' | 'DELIVERY' | 'CREDIT';
  title: string;
  message: string;
  href?: string;
}) {
  await prisma.appNotification.create({
    data: {
      clientId: params.clientId ?? undefined,
      type: params.type,
      title: params.title,
      message: params.message,
      href: params.href,
    },
  });
}

export async function recordDeliveryAttempt(params: {
  jobId: string;
  outcome: 'SUCCESS' | 'FAILED';
  reason?: string;
}) {
  const job = await prisma.deliveryJob.findUnique({
    where: { id: params.jobId },
    include: { attempts: { orderBy: { attemptNumber: 'asc' } } },
  });
  if (!job) return null;
  if (job.status === 'DELIVERED' || job.status === 'FAILED') return job;

  const nextNumber = job.attempts.length + 1;
  if (nextNumber > job.maxAttempts) return job;

  const now = new Date();
  const isLast = nextNumber >= job.maxAttempts;
  const nextAttemptAt =
    params.outcome === 'FAILED' && !isLast ? new Date(now.getTime() + 24 * 60 * 60 * 1000) : null;

  await prisma.deliveryAttempt.create({
    data: {
      deliveryJobId: job.id,
      attemptNumber: nextNumber,
      outcome: params.outcome,
      reason:
        params.outcome === 'FAILED'
          ? params.reason?.trim() || 'Customer unavailable at the delivery address'
          : null,
      attemptedAt: now,
      nextAttemptAt,
    },
  });

  const order = await prisma.order.findUnique({
    where: { orderNumber: job.orderNumber },
    include: { user: { include: { client: true } } },
  });
  const clientId = order?.user?.client?.id;

  if (params.outcome === 'SUCCESS') {
    await prisma.deliveryJob.update({
      where: { id: job.id },
      data: {
        status: 'DELIVERED',
        progress: 100,
        deliveredBy: 'ADMIN',
        deliveredAt: now,
      },
    });
    await prisma.order.update({
      where: { orderNumber: job.orderNumber },
      data: { status: 'DELIVERED' },
    });
    await prisma.orderTimelineStep.updateMany({
      where: { order: { orderNumber: job.orderNumber }, status: 'DELIVERED' },
      data: {
        timestamp: now,
        description: `Delivered on attempt ${nextNumber} of ${job.maxAttempts}.`,
      },
    });
    await notifyCustomer({
      clientId,
      type: 'DELIVERY',
      title: 'Parcel delivered',
      message: `Tracking ${job.trackingNumber ?? job.orderNumber}: delivery succeeded on attempt ${nextNumber}.`,
      href: `/orders/${job.orderNumber}`,
    });
  } else if (isLast) {
    await prisma.deliveryJob.update({
      where: { id: job.id },
      data: { status: 'FAILED', progress: 90 },
    });
    await notifyCustomer({
      clientId,
      type: 'DELIVERY',
      title: 'Delivery unsuccessful',
      message: `All ${job.maxAttempts} delivery attempts failed for ${job.orderNumber}. Reason: ${params.reason || 'not available'}. Please contact support.`,
      href: `/orders/${job.orderNumber}`,
    });
  } else {
    await prisma.deliveryJob.update({
      where: { id: job.id },
      data: {
        status: 'DELAYED',
        progress: 55 + nextNumber * 10,
        eta: `Attempt ${nextNumber + 1} of ${job.maxAttempts} tomorrow, 9 AM – 6 PM`,
      },
    });
    await notifyCustomer({
      clientId,
      type: 'DELIVERY',
      title: `Delivery attempt ${nextNumber} missed`,
      message: `Attempt ${nextNumber} of ${job.maxAttempts} failed (${params.reason || 'unavailable'}). Next attempt scheduled. Tracking ${job.trackingNumber ?? '—'}.`,
      href: `/orders/${job.orderNumber}`,
    });
  }

  return prisma.deliveryJob.findUnique({
    where: { id: job.id },
    include: { attempts: { orderBy: { attemptNumber: 'asc' } } },
  });
}

export type PlaceOrderInput = {
  userId: string;
  customerName: string;
  customerEmail: string;
  items: { productId?: string; name: string; image: string; quantity: number; price: number }[];
  vendorName: string;
  shipping: number;
  tax: number;
  paymentMethod: CheckoutPaymentMethod;
  transferReference?: string;
  deliveryOption: 'hour' | 'standard' | 'express' | 'scheduled';
  address: {
    fullName: string;
    line1: string;
    city: string;
    state: string;
    zip: string;
  };
};

export async function placeMarketplaceOrder(input: PlaceOrderInput) {
  const client = await ensureCustomerClient({
    userId: input.userId,
    firstName: input.customerName.split(' ')[0] ?? 'Customer',
    lastName: input.customerName.split(' ').slice(1).join(' ') || 'Account',
    email: input.customerEmail,
  });

  const subtotal = input.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal + input.shipping + input.tax;
  const itemCount = input.items.reduce((sum, item) => sum + item.quantity, 0);
  const now = new Date();
  const orderNumber = generateOrderNumber();
  const trackingNumber = generateTrackingNumber();
  const invoiceNumber = generateInvoiceNumber();
  const paymentReference = generatePaymentReference();
  const eta = etaForDelivery(input.deliveryOption);
  const destination = `${input.address.line1}, ${input.address.city}, ${input.address.state} ${input.address.zip}`;

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        orderNumber,
        userId: input.userId,
        date: now,
        status: 'CONFIRMED',
        total,
        itemCount,
        eta,
        vendorName: input.vendorName,
        trackingNumber,
        carrier: 'GoOrder Logistics',
        shippingName: input.address.fullName,
        shippingLine1: input.address.line1,
        shippingCity: input.address.city,
        shippingState: input.address.state,
        shippingZip: input.address.zip,
        paymentMethod: input.paymentMethod,
        items: {
          create: input.items.map((item) => ({
            productId: item.productId,
            name: item.name,
            image: item.image,
            quantity: item.quantity,
            price: item.price,
          })),
        },
        timeline: {
          create: [
            {
              status: 'CONFIRMED',
              label: 'Order placed',
              timestamp: now,
              description: `Paid via ${input.paymentMethod === 'BANK_ACCOUNT' ? 'bank transfer' : 'online transfer'} · ${paymentReference}.`,
            },
            {
              status: 'PROCESSING',
              label: 'Packed at warehouse',
              timestamp: input.deliveryOption === 'hour' ? now : null,
              description:
                input.deliveryOption === 'hour'
                  ? 'Parcel packed for same-hour dispatch.'
                  : 'Seller is packing your parcel.',
            },
            {
              status: 'SHIPPED',
              label: 'Dispatched',
              timestamp: null,
              description: `Tracking ${trackingNumber}. You will see the exact dispatch time here.`,
            },
            {
              status: 'OUT_FOR_DELIVERY',
              label: 'With rider',
              timestamp: null,
              description: `Estimated arrival: ${eta}. Up to 3 delivery attempts.`,
            },
            {
              status: 'DELIVERED',
              label: 'Delivered',
              timestamp: null,
              description: 'Pending delivery confirmation.',
            },
          ],
        },
      },
      include: { items: true, timeline: true, payment: true },
    });

    await tx.payment.create({
      data: {
        orderId: created.id,
        method: input.paymentMethod,
        status: 'CONFIRMED',
        amount: total,
        reference: paymentReference,
        bankName: GOORDER_BANK.bankName,
        accountTitle: GOORDER_BANK.accountTitle,
        accountNumber: GOORDER_BANK.accountNumber,
        transferReference: input.transferReference || paymentReference,
        paidAt: now,
      },
    });

    await tx.invoice.create({
      data: {
        invoiceNumber,
        vendorOrCustomer: input.customerName,
        clientId: client.id,
        type: 'RECEIVABLE',
        issueDate: now,
        dueDate: now,
        amount: total,
        amountPaid: total,
        status: 'PAID',
        orderNumber,
      },
    });

    await tx.deliveryJob.create({
      data: {
        orderNumber,
        customer: input.address.fullName,
        driver: 'Assigned at dispatch',
        driverPhone: '—',
        vehicle: 'GoOrder rider',
        status: 'PROCESSING',
        progress: 15,
        eta,
        origin: 'GoOrder fulfillment hub',
        destination,
        trackingNumber,
        scheduledWindow: eta,
      },
    });

    await tx.client.update({
      where: { id: client.id },
      data: {
        orderCount: { increment: 1 },
        totalSpend: { increment: total },
      },
    });

    return tx.order.findUniqueOrThrow({
      where: { id: created.id },
      include: { items: true, timeline: true, payment: true },
    });
  });

  await notifyCustomer({
    clientId: client.id,
    type: 'PAYMENT',
    title: 'Payment received',
    message: `${input.paymentMethod === 'BANK_ACCOUNT' ? 'Bank transfer' : 'Online transfer'} ${paymentReference} confirmed for ${orderNumber}.`,
    href: `/orders/${orderNumber}`,
  });
  await notifyCustomer({
    clientId: client.id,
    type: 'INVOICE',
    title: 'Invoice generated',
    message: `Invoice ${invoiceNumber} is ready for ${orderNumber}.`,
    href: `/invoices`,
  });
  await notifyCustomer({
    clientId: client.id,
    type: 'DELIVERY',
    title: 'Parcel is being prepared',
    message: `Tracking ${trackingNumber}. Estimated delivery: ${eta}. Up to 3 delivery attempts.`,
    href: `/orders/${orderNumber}`,
  });

  return { order, invoiceNumber, paymentReference, trackingNumber, eta };
}
