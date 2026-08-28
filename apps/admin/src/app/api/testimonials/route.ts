import { successResponse } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';
import { serializeTestimonial } from '@/lib/enterprise-mapper';

export async function GET() {
  const testimonials = await prisma.testimonial.findMany({ orderBy: { name: 'asc' } });

  return successResponse({ testimonials: testimonials.map(serializeTestimonial) });
}
