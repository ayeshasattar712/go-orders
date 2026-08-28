import { PERMISSIONS } from '@/constants/roles';
import {
  isResponse,
  requirePermission,
  requireStaffSession,
  sanitizeObjectStrings,
} from '@/lib/api-guard';
import { prisma } from '@/lib/prisma';
import { CATEGORY_STATUS_FROM_STRING, serializeCategory } from '@/lib/catalog/catalog-mapper';
import { slugify } from '@/lib/catalog/slugify';
import { updateCategorySchema } from '@/schemas/category.schema';
import { errorResponse, internalErrorResponse, successResponse } from '@/lib/api-response';
import { logger } from '@/lib/logger';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireStaffSession(request);
    if (isResponse(session)) return session;

    const allowed = requirePermission(session, PERMISSIONS.CATEGORIES_WRITE);
    if (allowed !== true) return allowed;

    const { id } = await params;
    const body = sanitizeObjectStrings(await request.json());
    const parsed = updateCategorySchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse('Validation failed', {
        status: 422,
        code: 'VALIDATION_ERROR',
        errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      });
    }

    const { slug, status, ...data } = parsed.data;
    const category = await prisma.category.update({
      where: { id },
      data: {
        ...data,
        ...(slug ? { slug: slugify(slug) } : {}),
        ...(status ? { status: CATEGORY_STATUS_FROM_STRING[status] } : {}),
      },
    });

    logger.info('Category updated', { staffId: session.sub, categoryId: id });

    return successResponse(
      { category: serializeCategory(category) },
      { message: 'Category updated' },
    );
  } catch (error) {
    logger.error('Category update failed', {
      error: error instanceof Error ? error.message : 'unknown',
    });
    return internalErrorResponse(error);
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireStaffSession(request);
    if (isResponse(session)) return session;

    const allowed = requirePermission(session, PERMISSIONS.CATEGORIES_DELETE);
    if (allowed !== true) return allowed;

    const { id } = await params;
    await prisma.category.delete({ where: { id } });

    logger.info('Category deleted', { staffId: session.sub, categoryId: id });

    return successResponse({ id }, { message: 'Category deleted' });
  } catch (error) {
    logger.error('Category deletion failed', {
      error: error instanceof Error ? error.message : 'unknown',
    });
    return internalErrorResponse(error);
  }
}
