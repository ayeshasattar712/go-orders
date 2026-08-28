import { PERMISSIONS } from '@/constants/roles';
import { isResponse, requirePermission, requireStaffSession } from '@/lib/api-guard';
import { prisma } from '@/lib/prisma';
import { successResponse } from '@/lib/api-response';

export async function GET(request: Request) {
  const session = await requireStaffSession(request);
  if (isResponse(session)) return session;

  const allowed = requirePermission(session, PERMISSIONS.ANALYTICS_READ);
  if (allowed !== true) return allowed;

  const categories = await prisma.category.findMany({
    include: {
      products: {
        include: {
          orderItems: {
            include: {
              order: true,
            },
          },
        },
      },
    },
  });

  const categoryRevenue = categories
    .map((category) => {
      const value = category.products.reduce((sum, product) => {
        return sum + product.orderItems.reduce((s, item) => s + item.price * item.quantity, 0);
      }, 0);
      return { label: category.name, value };
    })
    .filter((item) => item.value > 0);

  return successResponse({ categoryRevenue });
}
