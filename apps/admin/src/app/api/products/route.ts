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
import { createProductSchema } from '@/schemas/product.schema';
import { errorResponse, internalErrorResponse, successResponse } from '@/lib/api-response';
import { logger } from '@/lib/logger';

export const PRODUCT_INCLUDE = {
  category: true,
  bulkPricing: true,
  specifications: true,
  reviews: true,
} as const;

export async function GET(_request: Request) {
  const products = await prisma.product.findMany({
    include: PRODUCT_INCLUDE,
    orderBy: { createdAt: 'desc' },
  });
  return successResponse({ products: products.map(serializeProduct) });
}

export async function POST(request: Request) {
  try {
    const session = await requireStaffSession(request);
    if (isResponse(session)) return session;

    const allowed = requirePermission(session, PERMISSIONS.PRODUCTS_WRITE);
    if (allowed !== true) return allowed;

    const body = sanitizeObjectStrings(await request.json());
    const parsed = createProductSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse('Validation failed', {
        status: 422,
        code: 'VALIDATION_ERROR',
        errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      });
    }

    const { slug, stockStatus, bulkPricing, specifications, ...data } = parsed.data;
    const product = await prisma.product.create({
      data: {
        ...data,
        slug: slugify(slug ?? data.name),
        stockStatus: STOCK_STATUS_FROM_STRING[stockStatus],
        bulkPricing: { create: bulkPricing },
        specifications: { create: specifications },
      },
      include: PRODUCT_INCLUDE,
    });

    await prisma.category.update({
      where: { id: data.categoryId },
      data: { productCount: { increment: 1 } },
    });

    logger.info('Product created', { staffId: session.sub, productId: product.id });

    return successResponse(
      { product: serializeProduct(product) },
      { status: 201, message: 'Product created' },
    );
  } catch (error) {
    logger.error('Product creation failed', {
      error: error instanceof Error ? error.message : 'unknown',
    });
    return internalErrorResponse(error);
  }
}
