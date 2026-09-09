import { createQuotationSchema } from '@/schemas/quotation.schema';
import { isResponse, requireCustomerSession, sanitizeObjectStrings } from '@/lib/api-guard';
import { prisma } from '@/lib/prisma';
import { ensureCustomerClient } from '@/lib/commerce/fulfill-order';
import { generateQuotationNumber, serializeQuotation } from '@/lib/quotations/serialize';
import { errorResponse, internalErrorResponse, successResponse } from '@/lib/api-response';
import { logger } from '@/lib/logger';

export async function GET(request: Request) {
  const session = await requireCustomerSession(request);
  if (isResponse(session)) return session;

  const client = await prisma.client.findFirst({
    where: { userId: session.sub },
  });

  if (!client) {
    return successResponse({ quotations: [] });
  }

  const quotations = await prisma.quotation.findMany({
    where: { clientId: client.id },
    orderBy: { requestedAt: 'desc' },
  });

  return successResponse({ quotations: quotations.map(serializeQuotation) });
}

export async function POST(request: Request) {
  try {
    const session = await requireCustomerSession(request);
    if (isResponse(session)) return session;

    const body = sanitizeObjectStrings(await request.json());
    const parsed = createQuotationSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse('Validation failed', {
        status: 422,
        code: 'VALIDATION_ERROR',
        errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      });
    }

    const user = await prisma.user.findUnique({ where: { id: session.sub } });
    if (!user) {
      return errorResponse('Account not found', { status: 401, code: 'UNAUTHORIZED' });
    }

    const client = await ensureCustomerClient({
      userId: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    });

    const catalogProduct = parsed.data.productId
      ? await prisma.product.findUnique({
          where: { id: parsed.data.productId },
          include: { vendor: true },
        })
      : null;

    const catalogVendor = parsed.data.vendorId
      ? await prisma.vendor.findUnique({ where: { id: parsed.data.vendorId } })
      : null;

    const quantity = parsed.data.quantity;
    const unitPrice = catalogProduct?.price ?? null;
    const estimatedTotal =
      unitPrice != null ? unitPrice * quantity : (parsed.data.estimatedTotal ?? 0);

    const quotation = await prisma.quotation.create({
      data: {
        quotationNumber: generateQuotationNumber(),
        clientId: client.id,
        productName: catalogProduct?.name ?? parsed.data.productName,
        quantity,
        unit: catalogProduct?.unit ?? parsed.data.unit,
        notes: parsed.data.notes || null,
        estimatedTotal,
        status: 'REQUESTED',
        requestedAt: new Date(),
        vendorName: catalogProduct?.vendor.name ?? catalogVendor?.name ?? 'GoOrder',
      },
    });

    logger.info('Quotation requested', {
      userId: session.sub,
      quotationNumber: quotation.quotationNumber,
    });

    return successResponse(
      { quotation: serializeQuotation(quotation) },
      { status: 201, message: 'Quotation request sent to GoOrder' },
    );
  } catch (error) {
    logger.error('Quotation request failed', {
      error: error instanceof Error ? error.message : 'unknown',
    });
    return internalErrorResponse(error);
  }
}
