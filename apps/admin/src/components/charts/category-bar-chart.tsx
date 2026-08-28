'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from 'recharts';

interface CategoryBarChartProps {
  data: Array<{ label: string; value: number }>;
  color?: string;
  colors?: string[];
  height?: number;
  layout?: 'horizontal' | 'vertical';
}

export function CategoryBarChart({
  data,
  color = 'hsl(var(--primary))',
  colors,
  height = 280,
  layout = 'horizontal',
}: CategoryBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        layout={layout}
        margin={{ top: 8, right: 8, left: layout === 'vertical' ? 40 : -16, bottom: 0 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          className="stroke-border"
          horizontal={layout === 'horizontal'}
          vertical={layout === 'vertical'}
        />
        {layout === 'horizontal' ? (
          <>
            <XAxis dataKey="label" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} width={40} />
          </>
        ) : (
          <>
            <XAxis type="number" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
            <YAxis
              type="category"
              dataKey="label"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              width={120}
            />
          </>
        )}
        <Tooltip
          cursor={{ fill: 'hsl(var(--muted))' }}
          contentStyle={{
            borderRadius: 12,
            border: '1px solid hsl(var(--border))',
            background: 'hsl(var(--popover))',
            fontSize: 13,
          }}
        />
        <Bar dataKey="value" radius={[6, 6, 6, 6]} fill={color}>
          {colors
            ? data.map((_, index) => <Cell key={index} fill={colors[index % colors.length]} />)
            : null}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
