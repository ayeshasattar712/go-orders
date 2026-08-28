import type { Metadata } from 'next';
import { CheckCircle2, ShieldCheck, TrendingUp, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const metadata: Metadata = {
  title: 'Become a Vendor',
  description: 'Apply to sell on the GoOrder B2B marketplace.',
};

const benefits = [
  {
    icon: Users,
    title: 'Reach 48,000+ businesses',
    description: 'Tap into enterprise buyers actively procuring at scale.',
  },
  {
    icon: TrendingUp,
    title: 'Bulk order growth',
    description: 'Bulk pricing tools and RFQs drive larger average order values.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure, fast payments',
    description: 'Automated invoicing and payment tracking, net-30 support.',
  },
];

export default function VendorApplyPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <span className="bg-primary/10 text-primary inline-flex rounded-full px-3 py-1 text-xs font-medium">
            For Vendors
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Grow your business on GoOrder
          </h1>
          <p className="text-muted-foreground mt-3">
            Join thousands of verified suppliers reaching enterprise procurement teams every day.
          </p>

          <div className="mt-8 space-y-5">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="flex gap-3">
                <span className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                  <benefit.icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-medium">{benefit.title}</p>
                  <p className="text-muted-foreground text-sm">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-2xl border p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Vendor application</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Our partnerships team reviews applications within 2 business days.
          </p>
          <form className="mt-5 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company">Company name</Label>
              <Input id="company" placeholder="Acme Supply Co." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact-name">Contact name</Label>
                <Input id="contact-name" placeholder="Jane Doe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-email">Email</Label>
                <Input id="contact-email" type="email" placeholder="jane@acme.com" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="categories">Primary category</Label>
              <Input id="categories" placeholder="e.g. IT Equipment" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="volume">Estimated monthly order volume</Label>
              <Input id="volume" placeholder="e.g. $50,000" />
            </div>
            <Button type="submit" size="lg" className="w-full">
              <CheckCircle2 className="h-4 w-4" /> Submit application
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
