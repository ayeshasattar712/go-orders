import { prisma } from '@/lib/prisma';

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

  async function notify(type: 'DELIVERY', title: string, message: string) {
    if (!clientId) return;
    await prisma.appNotification.create({
      data: { clientId, type, title, message, href: `/orders/${job.orderNumber}` },
    });
  }

  if (params.outcome === 'SUCCESS') {
    await prisma.deliveryJob.update({
      where: { id: job.id },
      data: { status: 'DELIVERED', progress: 100, deliveredBy: 'ADMIN', deliveredAt: now },
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
    await notify(
      'DELIVERY',
      'Parcel delivered',
      `Tracking ${job.trackingNumber ?? job.orderNumber}: delivery succeeded on attempt ${nextNumber}.`,
    );
  } else if (isLast) {
    await prisma.deliveryJob.update({
      where: { id: job.id },
      data: { status: 'FAILED', progress: 90 },
    });
    await notify(
      'DELIVERY',
      'Delivery unsuccessful',
      `All ${job.maxAttempts} attempts failed for ${job.orderNumber}. Reason: ${params.reason || 'not available'}.`,
    );
  } else {
    await prisma.deliveryJob.update({
      where: { id: job.id },
      data: {
        status: 'DELAYED',
        progress: 55 + nextNumber * 10,
        eta: `Attempt ${nextNumber + 1} of ${job.maxAttempts} tomorrow, 9 AM – 6 PM`,
      },
    });
    await notify(
      'DELIVERY',
      `Delivery attempt ${nextNumber} missed`,
      `Attempt ${nextNumber} of ${job.maxAttempts} failed (${params.reason || 'unavailable'}). Next attempt scheduled.`,
    );
  }

  return prisma.deliveryJob.findUnique({
    where: { id: job.id },
    include: { attempts: { orderBy: { attemptNumber: 'asc' } } },
  });
}
