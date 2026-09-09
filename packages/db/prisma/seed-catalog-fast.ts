/**
 * Fast catalog backfill — inserts missing products with createMany batches.
 * Run from packages/db: npx tsx prisma/seed-catalog-fast.ts
 */
import { PrismaClient, type StockStatus } from '@prisma/client';
import { products } from '../../../apps/client/src/lib/mock-data/products';
import { categories } from '../../../apps/client/src/lib/mock-data/categories';

const prisma = new PrismaClient();

const stockStatusMap = (status: string): StockStatus => {
  if (status === 'low-stock') return 'LOW_STOCK';
  if (status === 'out-of-stock') return 'OUT_OF_STOCK';
  if (status === 'preorder') return 'PREORDER';
  return 'IN_STOCK';
};

async function main() {
  console.log(`Catalog has ${products.length} products in mock data.`);

  for (const category of categories) {
    await prisma.category.update({
      where: { id: category.id },
      data: { productCount: category.productCount },
    });
  }

  const existing = new Set(
    (await prisma.product.findMany({ select: { id: true } })).map((row) => row.id),
  );
  const missing = products.filter((product) => !existing.has(product.id));
  console.log(`Already in DB: ${existing.size}. Missing: ${missing.length}.`);

  const chunkSize = 25;
  let insertedTotal = 0;

  for (let i = 0; i < missing.length; i += chunkSize) {
    const chunk = missing.slice(i, i + chunkSize);
    const createdIds: string[] = [];

    for (const product of chunk) {
      try {
        await prisma.product.create({
          data: {
            id: product.id,
            slug: product.slug,
            name: product.name,
            shortDescription: product.shortDescription,
            description: product.description,
            images: product.images,
            categoryId: product.categoryId,
            vendorId: product.vendorId,
            price: product.price,
            compareAtPrice: product.compareAtPrice ?? null,
            currency: product.currency,
            rating: product.rating,
            reviewCount: product.reviewCount,
            stock: product.stock,
            stockStatus: stockStatusMap(product.stockStatus),
            sku: product.sku,
            unit: product.unit,
            minOrderQty: product.minOrderQty,
            tags: product.tags,
            isBestSeller: product.isBestSeller ?? false,
            isTrending: product.isTrending ?? false,
            isNew: product.isNew ?? false,
            deliveryEstimateDays: product.deliveryEstimateDays,
          },
        });
        createdIds.push(product.id);
      } catch {
        // Already inserted by a concurrent seed, or unique conflict — skip.
      }
    }

    const ready = chunk.filter((product) => createdIds.includes(product.id));
    if (ready.length === 0) {
      console.log(`Chunk ${i / chunkSize + 1}: nothing new, continuing...`);
      continue;
    }

    await prisma.bulkPriceTier.createMany({
      data: ready.flatMap((product) =>
        product.bulkPricing.map((tier) => ({
          productId: product.id,
          minQty: tier.minQty,
          maxQty: tier.maxQty,
          price: tier.price,
        })),
      ),
    });

    await prisma.productSpecification.createMany({
      data: ready.flatMap((product) =>
        product.specifications.map((spec) => ({
          productId: product.id,
          label: spec.label,
          value: spec.value,
        })),
      ),
    });

    await prisma.productReview.createMany({
      data: ready.flatMap((product) =>
        product.reviews.map((review) => ({
          id: review.id,
          productId: product.id,
          author: review.author,
          avatar: review.avatar,
          rating: review.rating,
          date: new Date(review.date),
          title: review.title,
          body: review.body,
          verified: review.verified,
          helpful: review.helpful,
        })),
      ),
      skipDuplicates: true,
    });

    insertedTotal += ready.length;
    console.log(`Inserted ${insertedTotal} / ${missing.length} (chunk +${ready.length})`);
  }

  const byCategory = await prisma.product.groupBy({
    by: ['categoryId'],
    _count: { _all: true },
  });
  console.log('Products per categoryId:', byCategory);
  console.log(`Done. Total products now: ${await prisma.product.count()}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
