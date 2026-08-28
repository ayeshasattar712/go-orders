import { getProducts } from '@/lib/catalog/catalog-repository';
import { internalErrorResponse, successResponse } from '@/lib/api-response';
import { logger } from '@/lib/logger';

/** Public marketplace catalog — no auth required. */
export async function GET() {
  try {
    const products = await getProducts();
    return successResponse({ products });
  } catch (error) {
    logger.error('Failed to list products', {
      error: error instanceof Error ? error.message : 'unknown',
    });
    return internalErrorResponse(error);
  }
}
