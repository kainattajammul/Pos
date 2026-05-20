"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { MONTH_LABELS } from "@/utils/format";
import type { MonthlySalesPoint } from "@/types/dashboard";
import { ChartContainer } from "./chart-container";

interface BarChartCardProps {
  data: MonthlySalesPoint[];
  height?: number;
}

export function BarChartCard({ data, height = 280 }: BarChartCardProps) {
  const chartData = data.map((point) => ({
    month: MONTH_LABELS[point.month - 1] ?? `M${point.month}`,
    total: Number(point.total),
  }));

  return (
    <ChartContainer height={height}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} barSize={22}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/50" />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
          />
          <Tooltip
            cursor={{ fill: "hsl(var(--muted))", opacity: 0.35 }}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid hsl(var(--border))",
              background: "hsl(var(--card))",
            }}
          />
          <Bar dataKey="total" fill="hsl(var(--muted-foreground))" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
