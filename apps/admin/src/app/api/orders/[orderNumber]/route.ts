import { PERMISSIONS } from '@/constants/roles';
import {
  isResponse,
  requirePermission,
  requireStaffSession,
  sanitizeObjectStrings,
} from '@/lib/api-guard';
import { prisma } from '@/lib/prisma';
import {
  FULFILLMENT_TIMELINE_SEQUENCE,
  ORDER_STATUS_FROM_STRING,
  serializeAdminOrder,
} from '@/lib/orders/order-mapper';
import { updateOrderStatusSchema } from '@/schemas/order.schema';
import { errorResponse, internalErrorResponse, successResponse } from '@/lib/api-response';
import { logger } from '@/lib/logger';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orderNumber: string }> },
) {
  const session = await requireStaffSession(request);
  if (isResponse(session)) return session;

  const allowed = requirePermission(session, PERMISSIONS.ORDERS_READ);
  if (allowed !== true) return allowed;

  const { orderNumber } = await params;
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { items: true, timeline: true, user: true },
  });

  if (!order) {
    return errorResponse('Order not found', { status: 404, code: 'NOT_FOUND' });
  }

  return successResponse({ order: serializeAdminOrder(order) });
}

/** Advances an order's fulfillment status — the actual "processing" action. */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ orderNumber: string }> },
) {
  try {
    const session = await requireStaffSession(request);
    if (isResponse(session)) return session;

    const allowed = requirePermission(session, PERMISSIONS.ORDERS_WRITE);
    if (allowed !== true) return allowed;

    const { orderNumber } = await params;
    const body = sanitizeObjectStrings(await request.json());
    const parsed = updateOrderStatusSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse('Validation failed', {
        status: 422,
        code: 'VALIDATION_ERROR',
        errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      });
    }

    const existing = await prisma.order.findUnique({
      where: { orderNumber },
      include: { timeline: true },
    });
    if (!existing) {
      return errorResponse('Order not found', { status: 404, code: 'NOT_FOUND' });
    }

    const { status } = parsed.data;
    const now = new Date();

    if (status === 'cancelled') {
      await prisma.order.update({
        where: { orderNumber },
        data: {
          status: 'CANCELLED',
          timeline: {
            create: {
              status: 'CANCELLED',
              label: 'Order cancelled',
              timestamp: now,
              description: 'Order was cancelled by staff.',
            },
          },
        },
      });
    } else {
      const targetIndex = FULFILLMENT_TIMELINE_SEQUENCE.indexOf(status);
      if (targetIndex === -1) {
        return errorResponse('Unsupported status transition', {
          status: 422,
          code: 'VALIDATION_ERROR',
        });
      }

      const reachedPrismaStatuses = new Set(
        FULFILLMENT_TIMELINE_SEQUENCE.slice(0, targetIndex + 1).map(
          (s) => ORDER_STATUS_FROM_STRING[s],
        ),
      );
      const stepsToComplete = existing.timeline.filter(
        (step) => step.timestamp === null && reachedPrismaStatuses.has(step.status),
      );

      await prisma.$transaction([
        prisma.order.update({
          where: { orderNumber },
          data: { status: ORDER_STATUS_FROM_STRING[status] },
        }),
        ...stepsToComplete.map((step) =>
          prisma.orderTimelineStep.update({
            where: { id: step.id },
            data: { timestamp: now },
          }),
        ),
      ]);
    }

    const order = await prisma.order.findUniqueOrThrow({
      where: { orderNumber },
      include: { items: true, timeline: true, user: true },
    });

    logger.info('Order status updated', { staffId: session.sub, orderNumber, status });

    return successResponse({ order: serializeAdminOrder(order) }, { message: 'Order updated' });
  } catch (error) {
    logger.error('Order status update failed', {
      error: error instanceof Error ? error.message : 'unknown',
    });
    return internalErrorResponse(error);
  }
}
