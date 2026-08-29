import { PERMISSIONS } from '@/constants/roles';
import { isResponse, requirePermission, requireStaffSession } from '@/lib/api-guard';
import { prisma } from '@/lib/prisma';
import { serializeRfqRequest } from '@/lib/enterprise-mapper';
import { errorResponse, successResponse } from '@/lib/api-response';

export async function GET(request: Request) {
  const session = await requireStaffSession(request);
  if (isResponse(session)) return session;

  const allowed = requirePermission(session, PERMISSIONS.RFQ_READ);
  if (allowed !== true) return allowed;

  const rfqs = await prisma.rfqRequest.findMany({ orderBy: { createdAt: 'desc' } });

  return successResponse({ rfqs: rfqs.map(serializeRfqRequest) });
}

export async function POST(request: Request) {
  const session = await requireStaffSession(request);
  if (isResponse(session)) return session;

  const allowed = requirePermission(session, PERMISSIONS.RFQ_WRITE);
  if (allowed !== true) return allowed;

  const body = (await request.json()) as {
    title?: string;
    requestedBy?: string;
    department?: string;
    category?: string;
    quantity?: number;
    estimatedValue?: number;
  };

  if (!body.title?.trim()) {
    return errorResponse('Title is required', { status: 422, code: 'VALIDATION_ERROR' });
  }
  if (!body.requestedBy?.trim()) {
    return errorResponse('Requester name is required', { status: 422, code: 'VALIDATION_ERROR' });
  }
  if (!body.department?.trim()) {
    return errorResponse('Department is required', { status: 422, code: 'VALIDATION_ERROR' });
  }
  if (!body.category?.trim()) {
    return errorResponse('Category is required', { status: 422, code: 'VALIDATION_ERROR' });
  }
  if (!body.quantity || body.quantity <= 0) {
    return errorResponse('Quantity must be greater than 0', { status: 422, code: 'VALIDATION_ERROR' });
  }
  if (!body.estimatedValue || body.estimatedValue <= 0) {
    return errorResponse('Estimated value must be greater than 0', {
      status: 422,
      code: 'VALIDATION_ERROR',
    });
  }

  const rfq = await prisma.rfqRequest.create({
    data: {
      title: body.title.trim(),
      requestedBy: body.requestedBy.trim(),
      department: body.department.trim(),
      category: body.category.trim(),
      quantity: body.quantity,
      estimatedValue: body.estimatedValue,
      status: 'DRAFT',
    },
  });

  return successResponse({ rfq: serializeRfqRequest(rfq) }, { status: 201 });
}
