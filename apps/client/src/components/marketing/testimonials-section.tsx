import Image from 'next/image';
import { Quote } from 'lucide-react';
import { testimonials } from '@/lib/mock-data';
import { Rating } from '@/components/ui/rating';

export function TestimonialsSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      <div className="mb-8 text-center">
        <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
          Trusted by procurement teams everywhere
        </h2>
        <p className="text-muted-foreground mt-2 text-sm">
          Real results from operations, finance, and facilities leaders.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {testimonials.map((testimonial) => (
          <figure
            key={testimonial.id}
            className="card-hover bg-card flex flex-col rounded-2xl border p-5"
          >
            <Quote className="text-primary/30 h-6 w-6" />
            <blockquote className="text-muted-foreground mt-3 flex-1 text-sm">
              &ldquo;{testimonial.quote}&rdquo;
            </blockquote>
            <Rating value={testimonial.rating} size="sm" className="mt-4" />
            <figcaption className="mt-3 flex items-center gap-3">
              <div className="bg-muted relative h-9 w-9 overflow-hidden rounded-full">
                <Image
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  fill
                  className="object-cover"
                  sizes="36px"
                />
              </div>
              <div>
                <p className="text-sm font-medium">{testimonial.name}</p>
                <p className="text-muted-foreground text-xs">
                  {testimonial.role}, {testimonial.company}
                </p>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
