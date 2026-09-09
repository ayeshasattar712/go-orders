'use client';

import {
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Minus,
  Sparkles,
  Target,
} from 'lucide-react';
import { KpiCard } from '@/components/shared/kpi-card';
import { Badge, type BadgeProps } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useDemandForecasts } from '@/services/queries';
import { cn } from '@/lib/utils';
import type { DemandForecastItem } from '@/types/enterprise';

const riskVariant: Record<DemandForecastItem['riskLevel'], BadgeProps['variant']> = {
  low: 'success',
  medium: 'warning',
  high: 'destructive',
};

const trendIcon = {
  up: ArrowUpRight,
  down: ArrowDownRight,
  stable: Minus,
} as const;

function ForecastCard({ forecast }: { forecast: DemandForecastItem }) {
  const TrendIcon = trendIcon[forecast.trend];
  const needsAction = forecast.suggestedReorderQty > 0;

  return (
    <article
      className={cn(
        'border-border bg-card flex h-full flex-col overflow-hidden rounded-2xl border shadow-sm',
        'transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md',
        forecast.riskLevel === 'high' && 'border-destructive/30',
      )}
    >
      <div className="flex flex-1 flex-col gap-6 p-6 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h3 className="text-foreground line-clamp-2 text-[15px] leading-6 font-semibold tracking-tight sm:text-base">
              {forecast.product}
            </h3>
            <p className="text-muted-foreground mt-1.5 text-sm leading-5">{forecast.category}</p>
          </div>
          <Badge
            variant={riskVariant[forecast.riskLevel]}
            className="shrink-0 self-start capitalize"
          >
            {forecast.riskLevel} risk
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="min-w-0 space-y-2">
            <p className="text-muted-foreground text-xs leading-4">Current stock</p>
            <p className="text-foreground text-lg leading-6 font-semibold tabular-nums">
              {forecast.currentStock}
              <span className="text-muted-foreground ml-1.5 text-sm font-normal">units</span>
            </p>
          </div>
          <div className="min-w-0 space-y-2">
            <p className="text-muted-foreground text-xs leading-4">Demand (30d)</p>
            <p className="text-foreground flex items-center gap-1.5 text-lg leading-6 font-semibold tabular-nums">
              <span>{forecast.predictedDemand}</span>
              <TrendIcon
                className={cn(
                  'h-4 w-4 shrink-0',
                  forecast.trend === 'up' && 'text-success',
                  forecast.trend === 'down' && 'text-destructive',
                  forecast.trend === 'stable' && 'text-muted-foreground',
                )}
              />
            </p>
          </div>
        </div>

        <div className="space-y-2.5">
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground text-xs leading-4">Model confidence</span>
            <span className="text-foreground text-xs font-semibold tabular-nums">
              {forecast.confidence}%
            </span>
          </div>
          <Progress value={forecast.confidence} className="h-2" />
        </div>
      </div>

      <div
        className={cn(
          'mx-6 mb-6 rounded-xl px-4 py-4 sm:mx-7 sm:mb-7',
          needsAction ? 'bg-primary/5' : 'bg-muted/70',
        )}
      >
        {needsAction ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div className="min-w-0 space-y-1">
              <p className="text-primary text-sm leading-5 font-semibold">
                Reorder {forecast.suggestedReorderQty} units
              </p>
              <p className="text-muted-foreground text-xs leading-4 break-words">
                Recommended: {forecast.suggestedVendor}
              </p>
            </div>
            <Button size="sm" className="w-full shrink-0 sm:w-auto">
              Act now <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        ) : (
          <p className="text-muted-foreground text-center text-sm leading-5">
            Stock levels are healthy — no action needed.
          </p>
        )}
      </div>
    </article>
  );
}

export default function AiForecastingPage() {
  const { data: demandForecasts = [] } = useDemandForecasts();

  const highRiskCount = demandForecasts.filter((f) => f.riskLevel === 'high').length;
  const reorderCount = demandForecasts.filter((f) => f.suggestedReorderQty > 0).length;
  const avgConfidence = demandForecasts.length
    ? Math.round(demandForecasts.reduce((sum, f) => sum + f.confidence, 0) / demandForecasts.length)
    : 0;

  const sorted = [...demandForecasts].sort((a, b) => {
    const rank = { high: 0, medium: 1, low: 2 };
    return rank[a.riskLevel] - rank[b.riskLevel] || b.confidence - a.confidence;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <span className="bg-hero-gradient shadow-primary/20 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white shadow-md">
            <Sparkles className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h2 className="text-2xl font-semibold tracking-tight">AI demand forecasting</h2>
            <p className="text-muted-foreground mt-1 max-w-xl text-sm leading-6">
              Predictive insights across inventory, procurement, and vendor selection.
            </p>
          </div>
        </div>
        <p className="text-muted-foreground text-xs tabular-nums">
          Tracking {demandForecasts.length} SKUs
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard
          label="Avg. forecast confidence"
          value={`${avgConfidence}%`}
          icon={Target}
          iconTone="primary"
        />
        <KpiCard
          label="High stock-risk items"
          value={highRiskCount.toString()}
          icon={AlertTriangle}
          iconTone="destructive"
        />
        <KpiCard
          label="Reorder actions suggested"
          value={reorderCount.toString()}
          icon={Sparkles}
          iconTone="success"
        />
      </div>

      <section className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold tracking-tight">Forecast queue</h3>
          <p className="text-muted-foreground mt-1 text-xs leading-5">
            Sorted by risk — act on high-priority SKUs first.
          </p>
        </div>

        <div className="grid gap-5 xl:grid-cols-2">
          {sorted.map((forecast) => (
            <ForecastCard key={forecast.id} forecast={forecast} />
          ))}
        </div>
      </section>
    </div>
  );
}
