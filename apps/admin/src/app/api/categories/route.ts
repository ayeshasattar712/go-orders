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
import { createCategorySchema } from '@/schemas/category.schema';
import { errorResponse, internalErrorResponse, successResponse } from '@/lib/api-response';
import { logger } from '@/lib/logger';

export async function GET(_request: Request) {
  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
  return successResponse({ categories: categories.map(serializeCategory) });
}

export async function POST(request: Request) {
  try {
    const session = await requireStaffSession(request);
    if (isResponse(session)) return session;

    const allowed = requirePermission(session, PERMISSIONS.CATEGORIES_WRITE);
    if (allowed !== true) return allowed;

    const body = sanitizeObjectStrings(await request.json());
    const parsed = createCategorySchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse('Validation failed', {
        status: 422,
        code: 'VALIDATION_ERROR',
        errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      });
    }

    const { slug, status, ...data } = parsed.data;
    const category = await prisma.category.create({
      data: {
        ...data,
        slug: slugify(slug ?? data.name),
        status: CATEGORY_STATUS_FROM_STRING[status],
      },
    });

    logger.info('Category created', { staffId: session.sub, categoryId: category.id });

    return successResponse(
      { category: serializeCategory(category) },
      { status: 201, message: 'Category created' },
    );
  } catch (error) {
    logger.error('Category creation failed', {
      error: error instanceof Error ? error.message : 'unknown',
    });
    return internalErrorResponse(error);
  }
}
