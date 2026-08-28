import { BadgeCheck } from 'lucide-react';
import { Rating } from '@/components/ui/rating';
import { Progress } from '@/components/ui/progress';
import { formatDate } from '@/lib/utils';
import type { Product } from '@/types/catalog';

export function ProductReviews({ product }: { product: Product }) {
  const distribution = [5, 4, 3, 2, 1].map((star) => {
    const count = product.reviews.filter((review) => review.rating === star).length;
    const percentage = product.reviews.length ? (count / product.reviews.length) * 100 : 0;
    return { star, count, percentage };
  });

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <div className="rounded-xl border p-5">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{product.rating.toFixed(1)}</span>
            <span className="text-muted-foreground">/ 5</span>
          </div>
          <Rating value={product.rating} size="md" className="mt-2" />
          <p className="text-muted-foreground mt-1 text-sm">
            Based on {product.reviewCount.toLocaleString()} reviews
          </p>

          <div className="mt-5 space-y-2">
            {distribution.map((row) => (
              <div key={row.star} className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground w-10 shrink-0">{row.star} star</span>
                <Progress value={row.percentage} className="h-1.5" />
                <span className="text-muted-foreground w-8 shrink-0 text-right text-xs">
                  {row.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-5 lg:col-span-2">
        {product.reviews.map((review) => (
          <div key={review.id} className="border-b pb-5 last:border-0">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="font-medium">{review.author}</p>
                <div className="mt-1 flex items-center gap-2">
                  <Rating value={review.rating} size="sm" />
                  {review.verified ? (
                    <span className="text-success flex items-center gap-1 text-xs">
                      <BadgeCheck className="h-3.5 w-3.5" /> Verified purchase
                    </span>
                  ) : null}
                </div>
              </div>
              <span className="text-muted-foreground shrink-0 text-xs">
                {formatDate(review.date)}
              </span>
            </div>
            <p className="mt-2 font-medium">{review.title}</p>
            <p className="text-muted-foreground mt-1 text-sm">{review.body}</p>
            <p className="text-muted-foreground mt-2 text-xs">
              {review.helpful} people found this helpful
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
