import { PERMISSIONS } from '@/constants/roles';
import {
  isResponse,
  requirePermission,
  requireStaffSession,
  sanitizeObjectStrings,
} from '@/lib/api-guard';
import { prisma } from '@/lib/prisma';
import { STOCK_STATUS_FROM_STRING, serializeProduct } from '@/lib/catalog/catalog-mapper';
import { slugify } from '@/lib/catalog/slugify';
import { updateProductSchema } from '@/schemas/product.schema';
import { errorResponse, internalErrorResponse, successResponse } from '@/lib/api-response';
import { logger } from '@/lib/logger';
import { PRODUCT_INCLUDE } from '@/app/api/products/route';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireStaffSession(request);
    if (isResponse(session)) return session;

    const allowed = requirePermission(session, PERMISSIONS.PRODUCTS_WRITE);
    if (allowed !== true) return allowed;

    const { id } = await params;
    const body = sanitizeObjectStrings(await request.json());
    const parsed = updateProductSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse('Validation failed', {
        status: 422,
        code: 'VALIDATION_ERROR',
        errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      });
    }

    const existing = await prisma.product.findUnique({
      where: { id },
      select: { categoryId: true },
    });
    if (!existing) {
      return errorResponse('Product not found', { status: 404, code: 'NOT_FOUND' });
    }

    const { slug, stockStatus, bulkPricing, specifications, ...data } = parsed.data;
    const product = await prisma.product.update({
      where: { id },
      data: {
        ...data,
        ...(slug ? { slug: slugify(slug) } : {}),
        ...(stockStatus ? { stockStatus: STOCK_STATUS_FROM_STRING[stockStatus] } : {}),
        ...(bulkPricing ? { bulkPricing: { deleteMany: {}, create: bulkPricing } } : {}),
        ...(specifications ? { specifications: { deleteMany: {}, create: specifications } } : {}),
      },
      include: PRODUCT_INCLUDE,
    });

    if (data.categoryId && data.categoryId !== existing.categoryId) {
      await prisma.category.update({
        where: { id: existing.categoryId },
        data: { productCount: { decrement: 1 } },
      });
      await prisma.category.update({
        where: { id: data.categoryId },
        data: { productCount: { increment: 1 } },
      });
    }

    logger.info('Product updated', { staffId: session.sub, productId: id });

    return successResponse({ product: serializeProduct(product) }, { message: 'Product updated' });
  } catch (error) {
    logger.error('Product update failed', {
      error: error instanceof Error ? error.message : 'unknown',
    });
    return internalErrorResponse(error);
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireStaffSession(request);
    if (isResponse(session)) return session;

    const allowed = requirePermission(session, PERMISSIONS.PRODUCTS_DELETE);
    if (allowed !== true) return allowed;

    const { id } = await params;
    const product = await prisma.product.delete({ where: { id } });

    await prisma.category.update({
      where: { id: product.categoryId },
      data: { productCount: { decrement: 1 } },
    });

    logger.info('Product deleted', { staffId: session.sub, productId: id });

    return successResponse({ id }, { message: 'Product deleted' });
  } catch (error) {
    logger.error('Product deletion failed', {
      error: error instanceof Error ? error.message : 'unknown',
    });
    return internalErrorResponse(error);
  }
}
