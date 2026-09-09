import type { Metadata } from 'next';
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Minus,
  Sparkles,
  Target,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge, type BadgeProps } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { demandForecasts } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

export const metadata: Metadata = { title: 'AI Demand Forecasting' };

const riskVariant: Record<string, BadgeProps['variant']> = {
  low: 'success',
  medium: 'warning',
  high: 'destructive',
};

const trendIcon = { up: ArrowUpRight, down: ArrowDownRight, stable: Minus };

export default function AiForecastingPage() {
  const highRiskCount = demandForecasts.filter((f) => f.riskLevel === 'high').length;
  const avgConfidence = Math.round(
    demandForecasts.reduce((sum, f) => sum + f.confidence, 0) / demandForecasts.length,
  );

  return (
    <div className="space-y-8">
      <div className="flex items-start gap-3">
        <span className="bg-hero-gradient flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white">
          <Sparkles className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h2 className="text-2xl font-semibold tracking-tight">AI demand forecasting</h2>
          <p className="text-muted-foreground mt-1 text-sm leading-6">
            Predictive insights across inventory, procurement, and vendor selection.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="flex items-center gap-3 p-6">
            <Target className="text-primary h-8 w-8 shrink-0" />
            <div className="min-w-0">
              <p className="text-muted-foreground text-sm">Average forecast confidence</p>
              <p className="text-2xl font-bold">{avgConfidence}%</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="flex items-center gap-3 p-6">
            <AlertTriangle className="text-destructive h-8 w-8 shrink-0" />
            <div className="min-w-0">
              <p className="text-muted-foreground text-sm">High stock-risk items</p>
              <p className="text-2xl font-bold">{highRiskCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-success/30 bg-success/5">
          <CardContent className="flex items-center gap-3 p-6">
            <Sparkles className="text-success h-8 w-8 shrink-0" />
            <div className="min-w-0">
              <p className="text-muted-foreground text-sm">Reorder actions suggested</p>
              <p className="text-2xl font-bold">
                {demandForecasts.filter((f) => f.suggestedReorderQty > 0).length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        {demandForecasts.map((forecast) => {
          const TrendIcon = trendIcon[forecast.trend];
          const needsAction = forecast.suggestedReorderQty > 0;

          return (
            <article
              key={forecast.id}
              className={cn(
                'border-border bg-card flex h-full flex-col overflow-hidden rounded-2xl border shadow-sm',
                forecast.riskLevel === 'high' && 'border-destructive/30',
              )}
            >
              <div className="flex flex-1 flex-col gap-6 p-6 sm:p-7">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-[15px] leading-6 font-semibold sm:text-base">
                      {forecast.product}
                    </p>
                    <p className="text-muted-foreground mt-1.5 text-sm leading-5">
                      {forecast.category}
                    </p>
                  </div>
                  <Badge variant={riskVariant[forecast.riskLevel]} className="shrink-0 capitalize">
                    {forecast.riskLevel} risk
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="min-w-0 space-y-2">
                    <p className="text-muted-foreground text-xs leading-4">Current stock</p>
                    <p className="text-lg leading-6 font-semibold tabular-nums">
                      {forecast.currentStock}
                      <span className="text-muted-foreground ml-1.5 text-sm font-normal">units</span>
                    </p>
                  </div>
                  <div className="min-w-0 space-y-2">
                    <p className="text-muted-foreground text-xs leading-4">Demand (30d)</p>
                    <p className="flex items-center gap-1.5 text-lg leading-6 font-semibold tabular-nums">
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
                    <span className="text-xs font-semibold tabular-nums">{forecast.confidence}%</span>
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
        })}
      </div>
    </div>
  );
}
