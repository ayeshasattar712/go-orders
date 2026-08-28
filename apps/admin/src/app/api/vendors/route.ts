import { PERMISSIONS } from '@/constants/roles';
import {
  isResponse,
  requirePermission,
  requireStaffSession,
  sanitizeObjectStrings,
} from '@/lib/api-guard';
import { prisma } from '@/lib/prisma';
import { serializeVendor } from '@/lib/catalog/catalog-mapper';
import { slugify } from '@/lib/catalog/slugify';
import { createVendorSchema } from '@/schemas/vendor.schema';
import { errorResponse, internalErrorResponse, successResponse } from '@/lib/api-response';
import { logger } from '@/lib/logger';

export async function GET(_request: Request) {
  const vendors = await prisma.vendor.findMany({
    include: { categories: true },
    orderBy: { name: 'asc' },
  });
  return successResponse({ vendors: vendors.map(serializeVendor) });
}

/** New vendors always start pending/unverified — approval happens via PATCH. */
export async function POST(request: Request) {
  try {
    const session = await requireStaffSession(request);
    if (isResponse(session)) return session;

    const allowed = requirePermission(session, PERMISSIONS.VENDORS_WRITE);
    if (allowed !== true) return allowed;

    const body = sanitizeObjectStrings(await request.json());
    const parsed = createVendorSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse('Validation failed', {
        status: 422,
        code: 'VALIDATION_ERROR',
        errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      });
    }

    const { slug, categories, ...data } = parsed.data;
    const vendor = await prisma.vendor.create({
      data: {
        ...data,
        slug: slugify(slug ?? data.name),
        status: 'PENDING',
        verified: false,
        rating: 0,
        reviewCount: 0,
        fulfillmentRate: 0,
        yearsActive: 0,
        performanceScore: 70,
        registeredAt: new Date(),
        categories: { connect: categories.map((id) => ({ id })) },
      },
      include: { categories: true },
    });

    logger.info('Vendor registered', { staffId: session.sub, vendorId: vendor.id });

    return successResponse(
      { vendor: serializeVendor(vendor) },
      { status: 201, message: 'Vendor registered' },
    );
  } catch (error) {
    logger.error('Vendor registration failed', {
      error: error instanceof Error ? error.message : 'unknown',
    });
    return internalErrorResponse(error);
  }
}
