"use client";

import { DonutChart } from "@/components/charts/donut-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { mockRepairLegend } from "@/lib/mock-data";
import type { RepairReport } from "@/types/dashboard";
import { formatCurrency } from "@/utils/format";
import { ChartLegend } from "./chart-legend";

interface RepairReportsSectionProps {
  report?: RepairReport;
  isLoading?: boolean;
}

export function RepairReportsSection({ report, isLoading }: RepairReportsSectionProps) {
  if (isLoading || !report) {
    return (
      <Card className="border-0 shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
        <CardHeader>
          <Skeleton className="h-6 w-36" />
        </CardHeader>
        <CardContent>
          <Skeleton className="mx-auto h-[200px] w-[200px] rounded-full" />
        </CardContent>
      </Card>
    );
  }

  const chartData = mockRepairLegend.map((item, index) => {
    const values = [
      report.completed,
      report.pending,
      report.inProgress,
      report.cancelled,
      Math.round(report.averageRepairHours),
    ];
    return { ...item, value: values[index] ?? item.value };
  });

  const repairRevenue = report.completed * 85;

  return (
    <Card className="border-0 bg-card/90 shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Repair Report</CardTitle>
        <p className="text-sm text-muted-foreground">
          Revenue{" "}
          <span className="font-semibold text-primary">{formatCurrency(repairRevenue)}</span>
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid min-w-0 gap-6 md:grid-cols-[1fr_auto] md:items-center">
          <div className="min-w-0 w-full">
            <DonutChart data={chartData} height={220} innerRadius={50} outerRadius={78} />
          </div>
          <ChartLegend items={chartData} />
        </div>
      </CardContent>
    </Card>
  );
}
