"use client";

import Link from "next/link";
import { DonutChart } from "@/components/charts/donut-chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { mockInventoryHealth } from "@/lib/mock-data";
import type { StockHealthSegment } from "@/types/dashboard";
import { ChartLegend } from "./chart-legend";

interface StockStatusSectionProps {
  segments?: StockHealthSegment[];
  isLoading?: boolean;
}

export function StockStatusSection({
  segments = mockInventoryHealth,
  isLoading,
}: StockStatusSectionProps) {
  const chartData = segments.map((s) => ({
    label: s.label,
    value: s.value,
    color: s.color,
  }));

  if (isLoading) {
    return (
      <Card className="border-0 shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="mt-2 h-4 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="mx-auto h-[220px] w-[220px] rounded-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 bg-card/90 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg">Stock Status</CardTitle>
        <CardDescription>Inventory health by quantity range</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
          <DonutChart data={chartData} height={240} />
          <ChartLegend items={chartData} />
        </div>
        <Link
          href="/inventory"
          className="mt-6 inline-flex h-8 w-full items-center justify-center rounded-lg border border-border bg-background text-sm font-medium transition hover:bg-muted"
        >
          View full report
        </Link>
      </CardContent>
    </Card>
  );
}
