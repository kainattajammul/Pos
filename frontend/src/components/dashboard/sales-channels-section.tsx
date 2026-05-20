"use client";

import { DonutChart } from "@/components/charts/donut-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockSalesChannels } from "@/lib/mock-data";
import { ChartLegend } from "./chart-legend";

export function SalesChannelsSection() {
  return (
    <Card className="border-0 bg-card/90 shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
      <CardHeader>
        <CardTitle className="text-lg">Sales Channels</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
          <DonutChart data={mockSalesChannels} height={220} innerRadius={50} outerRadius={78} />
          <ChartLegend items={mockSalesChannels} />
        </div>
      </CardContent>
    </Card>
  );
}
