"use client";

import Link from "next/link";
import { BarChartCard } from "@/components/charts/bar-chart-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { MonthlySalesPoint } from "@/types/dashboard";

interface RecentActivitySectionProps {
  data?: MonthlySalesPoint[];
  isLoading?: boolean;
}

export function RecentActivitySection({ data, isLoading }: RecentActivitySectionProps) {
  if (isLoading || !data) {
    return (
      <Card className="border-0 shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
        <CardHeader>
          <Skeleton className="h-6 w-36" />
          <Skeleton className="mt-2 h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[280px] w-full rounded-xl" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 bg-card/90 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg">Recent Activity</CardTitle>
        <CardDescription>
          Track real-time sales, stock movements, and repair updates across your shop.
        </CardDescription>
      </CardHeader>
      <CardContent className="min-w-0">
        <div className="min-w-0 w-full">
          <BarChartCard data={data} />
        </div>
        <Link
          href="/reports"
          className="mt-6 inline-flex h-8 w-full items-center justify-center rounded-lg border border-border bg-background text-sm font-medium transition hover:bg-muted"
        >
          View full report
        </Link>
      </CardContent>
    </Card>
  );
}
