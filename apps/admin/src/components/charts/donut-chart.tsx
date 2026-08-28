'use client';

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

interface DonutChartProps {
  data: Array<{ label: string; value: number; color: string }>;
  height?: number;
  innerRadius?: number;
}

export function DonutChart({ data, height = 220, innerRadius = 60 }: DonutChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="label"
          innerRadius={innerRadius}
          outerRadius={innerRadius + 30}
          paddingAngle={3}
          strokeWidth={0}
        >
          {data.map((entry) => (
            <Cell key={entry.label} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            borderRadius: 12,
            border: '1px solid hsl(var(--border))',
            background: 'hsl(var(--popover))',
            fontSize: 13,
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
