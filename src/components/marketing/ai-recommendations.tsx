'use client';

import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, AlertTriangle, Boxes, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const insights = [
  {
    icon: TrendingUp,
    tone: 'success' as const,
    title: 'Demand rising for IT Equipment',
    body: 'Laptop and monitor demand in your industry is trending +22% this quarter. Consider pre-ordering before the price window closes.',
    action: 'View forecast',
    href: '/ai/demand-forecasting',
  },
  {
    icon: AlertTriangle,
    tone: 'warning' as const,
    title: 'Stock risk: Copy paper',
    body: 'Based on your reorder cadence, current copy paper stock will run out in 9 days. We recommend reordering now to avoid a gap.',
    action: 'Reorder now',
    href: '/products/apex-premium-copy-paper-case',
  },
  {
    icon: Boxes,
    tone: 'info' as const,
    title: 'Smarter vendor match found',
    body: 'ClearLine Janitorial Supply offers a 12% lower rate on your most-ordered cleaning SKUs with equal delivery performance.',
    action: 'Compare vendor',
    href: '/vendors/clearline-janitorial-supply',
  },
];

const toneStyles = {
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  info: 'bg-info/10 text-info',
};

export function AIRecommendations() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      <div className="mb-6 flex items-center gap-3">
        <span className="bg-hero-gradient flex h-10 w-10 items-center justify-center rounded-xl text-white">
          <Sparkles className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">AI procurement insights</h2>
          <p className="text-muted-foreground text-sm">
            Personalized recommendations based on your order history and market trends.
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {insights.map((insight, index) => (
          <motion.div
            key={insight.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.4, delay: index * 0.08 }}
            className="card-hover bg-card flex flex-col rounded-2xl border p-5"
          >
            <span
              className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${toneStyles[insight.tone]}`}
            >
              <insight.icon className="h-5 w-5" />
            </span>
            <h3 className="font-semibold">{insight.title}</h3>
            <p className="text-muted-foreground mt-2 flex-1 text-sm">{insight.body}</p>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="mt-4 justify-start px-0 hover:bg-transparent hover:underline"
            >
              <Link href={insight.href}>
                {insight.action} <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
