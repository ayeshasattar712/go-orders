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
import { Card, CardContent } from '@/components/ui/card';
import { Badge, type BadgeProps } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useDemandForecasts } from '@/services/queries';
import { cn } from '@/lib/utils';

const riskVariant: Record<string, BadgeProps['variant']> = {
  low: 'success',
  medium: 'warning',
  high: 'destructive',
};

const trendIcon = { up: ArrowUpRight, down: ArrowDownRight, stable: Minus };

export default function AiForecastingPage() {
  const { data: demandForecasts = [] } = useDemandForecasts();

  const highRiskCount = demandForecasts.filter((f) => f.riskLevel === 'high').length;
  const avgConfidence = demandForecasts.length
    ? Math.round(demandForecasts.reduce((sum, f) => sum + f.confidence, 0) / demandForecasts.length)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="bg-hero-gradient flex h-11 w-11 items-center justify-center rounded-2xl text-white">
          <Sparkles className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">AI demand forecasting</h2>
          <p className="text-muted-foreground">
            Predictive insights across inventory, procurement, and vendor selection.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="flex items-center gap-3 pt-6">
            <Target className="text-primary h-8 w-8" />
            <div>
              <p className="text-muted-foreground text-sm">Average forecast confidence</p>
              <p className="text-2xl font-bold">{avgConfidence}%</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="flex items-center gap-3 pt-6">
            <AlertTriangle className="text-destructive h-8 w-8" />
            <div>
              <p className="text-muted-foreground text-sm">High stock-risk items</p>
              <p className="text-2xl font-bold">{highRiskCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-success/30 bg-success/5">
          <CardContent className="flex items-center gap-3 pt-6">
            <Sparkles className="text-success h-8 w-8" />
            <div>
              <p className="text-muted-foreground text-sm">Reorder actions suggested</p>
              <p className="text-2xl font-bold">
                {demandForecasts.filter((f) => f.suggestedReorderQty > 0).length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {demandForecasts.map((forecast) => {
          const TrendIcon = trendIcon[forecast.trend];
          return (
            <Card key={forecast.id} className="overflow-hidden">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{forecast.product}</p>
                    <p className="text-muted-foreground text-xs">{forecast.category}</p>
                  </div>
                  <Badge variant={riskVariant[forecast.riskLevel]}>{forecast.riskLevel} risk</Badge>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Current stock</p>
                    <p className="font-semibold">{forecast.currentStock} units</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Predicted demand (30d)</p>
                    <p className="flex items-center gap-1 font-semibold">
                      {forecast.predictedDemand} units
                      <TrendIcon
                        className={cn(
                          'h-3.5 w-3.5',
                          forecast.trend === 'up' && 'text-success',
                          forecast.trend === 'down' && 'text-destructive',
                        )}
                      />
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-muted-foreground">Model confidence</span>
                    <span className="font-medium">{forecast.confidence}%</span>
                  </div>
                  <Progress value={forecast.confidence} className="h-1.5" />
                </div>

                {forecast.suggestedReorderQty > 0 ? (
                  <div className="bg-primary/5 mt-4 flex items-center justify-between rounded-xl p-3">
                    <div className="text-sm">
                      <p className="text-primary font-medium">
                        Reorder {forecast.suggestedReorderQty} units
                      </p>
                      <p className="text-muted-foreground text-xs">
                        Recommended: {forecast.suggestedVendor}
                      </p>
                    </div>
                    <Button size="sm" variant="default">
                      Act now <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ) : (
                  <div className="bg-muted/60 text-muted-foreground mt-4 rounded-xl p-3 text-sm">
                    Stock levels are healthy — no action needed.
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
