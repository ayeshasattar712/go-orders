import { PERMISSIONS } from '@/constants/roles';
import { isResponse, requirePermission, requireStaffSession } from '@/lib/api-guard';
import { recordDeliveryAttempt } from '@/lib/commerce/record-delivery-attempt';
import { prisma } from '@/lib/prisma';
import { serializeDeliveryJob } from '@/lib/enterprise-mapper';
import { errorResponse, successResponse } from '@/lib/api-response';

export async function POST(request: Request) {
  const session = await requireStaffSession(request);
  if (isResponse(session)) return session;

  const allowed = requirePermission(session, PERMISSIONS.DELIVERY_WRITE);
  if (allowed !== true) return allowed;

  const body = (await request.json()) as {
    jobId?: string;
    outcome?: 'success' | 'failed';
    reason?: string;
  };

  if (!body.jobId || (body.outcome !== 'success' && body.outcome !== 'failed')) {
    return errorResponse('jobId and outcome are required', {
      status: 422,
      code: 'VALIDATION_ERROR',
    });
  }

  const job = await recordDeliveryAttempt({
    jobId: body.jobId,
    outcome: body.outcome === 'success' ? 'SUCCESS' : 'FAILED',
    reason: body.reason,
  });

  if (!job) return errorResponse('Delivery job not found', { status: 404, code: 'NOT_FOUND' });

  const fresh = await prisma.deliveryJob.findUnique({
    where: { id: job.id },
    include: { attempts: true },
  });
  if (!fresh) return errorResponse('Delivery job not found', { status: 404, code: 'NOT_FOUND' });

  return successResponse({ job: serializeDeliveryJob(fresh) });
}
