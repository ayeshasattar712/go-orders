'use client';

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface RevenueTrendChartProps {
  data: object[];
  xKey: string;
  series: { key: string; color: string; label: string }[];
  height?: number;
}

export function RevenueTrendChart({ data, xKey, series, height = 280 }: RevenueTrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <defs>
          {series.map((s) => (
            <linearGradient key={s.key} id={`gradient-${s.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={s.color} stopOpacity={0.35} />
              <stop offset="95%" stopColor={s.color} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
        <XAxis dataKey={xKey} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} width={48} />
        <Tooltip
          contentStyle={{
            borderRadius: 12,
            border: '1px solid hsl(var(--border))',
            background: 'hsl(var(--popover))',
            fontSize: 13,
          }}
        />
        {series.map((s) => (
          <Area
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.label}
            stroke={s.color}
            strokeWidth={2.5}
            fill={`url(#gradient-${s.key})`}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}
