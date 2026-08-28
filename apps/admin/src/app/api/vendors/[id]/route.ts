import { PERMISSIONS } from '@/constants/roles';
import {
  isResponse,
  requirePermission,
  requireStaffSession,
  sanitizeObjectStrings,
} from '@/lib/api-guard';
import { prisma } from '@/lib/prisma';
import { VENDOR_STATUS_FROM_STRING, serializeVendor } from '@/lib/catalog/catalog-mapper';
import { slugify } from '@/lib/catalog/slugify';
import { updateVendorSchema } from '@/schemas/vendor.schema';
import { errorResponse, internalErrorResponse, successResponse } from '@/lib/api-response';
import { logger } from '@/lib/logger';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireStaffSession(request);
    if (isResponse(session)) return session;

    const allowed = requirePermission(session, PERMISSIONS.VENDORS_WRITE);
    if (allowed !== true) return allowed;

    const { id } = await params;
    const body = sanitizeObjectStrings(await request.json());
    const parsed = updateVendorSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse('Validation failed', {
        status: 422,
        code: 'VALIDATION_ERROR',
        errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      });
    }

    const { slug, categories, status, ...data } = parsed.data;
    const vendor = await prisma.vendor.update({
      where: { id },
      data: {
        ...data,
        ...(slug ? { slug: slugify(slug) } : {}),
        ...(categories
          ? { categories: { set: categories.map((categoryId) => ({ id: categoryId })) } }
          : {}),
        ...(status
          ? {
              status: VENDOR_STATUS_FROM_STRING[status],
              verified: status === 'approved' ? true : undefined,
            }
          : {}),
      },
      include: { categories: true },
    });

    logger.info('Vendor updated', { staffId: session.sub, vendorId: id });

    return successResponse({ vendor: serializeVendor(vendor) }, { message: 'Vendor updated' });
  } catch (error) {
    logger.error('Vendor update failed', {
      error: error instanceof Error ? error.message : 'unknown',
    });
    return internalErrorResponse(error);
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireStaffSession(request);
    if (isResponse(session)) return session;

    const allowed = requirePermission(session, PERMISSIONS.VENDORS_DELETE);
    if (allowed !== true) return allowed;

    const { id } = await params;
    await prisma.vendor.delete({ where: { id } });

    logger.info('Vendor deleted', { staffId: session.sub, vendorId: id });

    return successResponse({ id }, { message: 'Vendor deleted' });
  } catch (error) {
    logger.error('Vendor deletion failed', {
      error: error instanceof Error ? error.message : 'unknown',
    });
    return internalErrorResponse(error);
  }
}
