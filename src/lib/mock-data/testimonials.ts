import type { Testimonial } from '@/types/catalog';

export const testimonials: Testimonial[] = [
  {
    id: 'test_1',
    name: 'Jennifer Alvarez',
    role: 'Head of Procurement',
    company: 'Meridian Health Systems',
    avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=Jennifer',
    quote:
      'GoOrder consolidated 14 vendor relationships into one platform. Our procurement cycle time dropped by 40% in the first quarter alone.',
    rating: 5,
  },
  {
    id: 'test_2',
    name: 'Marcus Chen',
    role: 'Operations Director',
    company: 'Brightline Logistics',
    avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=Marcus',
    quote:
      'The bulk pricing tiers and RFQ workflow alone paid for the platform in the first two months. Our finance team loves the invoice automation.',
    rating: 5,
  },
  {
    id: 'test_3',
    name: 'Aisha Rahman',
    role: 'Facilities Manager',
    company: 'Cascade Financial Group',
    avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=Aisha',
    quote:
      'Inventory visibility across our 12 branch offices used to be a nightmare. Now low-stock alerts and reorder suggestions keep everything running smoothly.',
    rating: 5,
  },
  {
    id: 'test_4',
    name: 'David Kim',
    role: 'VP of Supply Chain',
    company: 'Horizon Manufacturing',
    avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=David',
    quote:
      'Vendor comparison and quotation tools gave our team real negotiating leverage for the first time. Transparent, fast, and genuinely enterprise-grade.',
    rating: 4,
  },
];
