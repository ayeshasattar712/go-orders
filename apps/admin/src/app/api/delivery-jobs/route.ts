import { PERMISSIONS } from '@/constants/roles';
import { isResponse, requirePermission, requireStaffSession } from '@/lib/api-guard';
import { prisma } from '@/lib/prisma';
import { serializeDeliveryJob } from '@/lib/enterprise-mapper';
import { successResponse } from '@/lib/api-response';

export async function GET(request: Request) {
  const session = await requireStaffSession(request);
  if (isResponse(session)) return session;

  const allowed = requirePermission(session, PERMISSIONS.DELIVERY_READ);
  if (allowed !== true) return allowed;

  const jobs = await prisma.deliveryJob.findMany({
    include: { attempts: { orderBy: { attemptNumber: 'asc' } } },
    orderBy: { createdAt: 'desc' },
  });

  return successResponse({ jobs: jobs.map(serializeDeliveryJob) });
}

export async function PATCH(request: Request) {
  const session = await requireStaffSession(request);
  if (isResponse(session)) return session;

  const allowed = requirePermission(session, PERMISSIONS.DELIVERY_WRITE);
  if (allowed !== true) return allowed;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return new Response('Missing id', { status: 400 });

  const body = await request.json();
  const job = await prisma.deliveryJob.update({
    where: { id },
    data: {
      ...body,
      status: body.status ? body.status.toUpperCase() : undefined,
      deliveredBy: body.deliveredBy ? body.deliveredBy.toUpperCase() : undefined,
      deliveredAt: body.deliveredAt ? new Date(body.deliveredAt) : undefined,
    },
  });

  return successResponse({ job: serializeDeliveryJob(job) });
}
