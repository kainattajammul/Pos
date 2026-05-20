"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { ChartLegendItem } from "@/types/dashboard";
import { ChartContainer } from "./chart-container";

interface DonutChartProps {
  data: ChartLegendItem[];
  height?: number;
  innerRadius?: number;
  outerRadius?: number;
}

export function DonutChart({
  data,
  height = 260,
  innerRadius = 58,
  outerRadius = 88,
}: DonutChartProps) {
  return (
    <ChartContainer height={height}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="label"
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={3}
            strokeWidth={0}
            isAnimationActive
          >
            {data.map((entry) => (
              <Cell key={entry.label} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => [Number(value ?? 0).toLocaleString(), "Count"]}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid hsl(var(--border))",
              background: "hsl(var(--card))",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
