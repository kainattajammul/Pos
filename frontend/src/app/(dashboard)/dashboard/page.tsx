"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ActivityTimeline } from "@/components/dashboard/activity-timeline";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { RecentActivitySection } from "@/components/dashboard/recent-activity-section";
import { RepairReportsSection } from "@/components/dashboard/repair-reports-section";
import { SalesChannelsSection } from "@/components/dashboard/sales-channels-section";
import { StatCard } from "@/components/dashboard/stat-card";
import { StockStatusSection } from "@/components/dashboard/stock-status-section";
import { ProductsTable } from "@/components/tables/products-table";
import { ErrorBoundary } from "@/components/shared/error-boundary";
import {
  useDashboardSummary,
  useMonthlySales,
  useRecentActivities,
  useRepairReports,
} from "@/hooks/use-dashboard";
import { mockStatCards } from "@/lib/mock-data";

export default function DashboardPage() {
  const gridRef = useRef<HTMLDivElement>(null);
  const { isLoading: summaryLoading } = useDashboardSummary();
  const { data: monthlySales, isLoading: monthlyLoading } = useMonthlySales();
  const { data: activities, isLoading: activitiesLoading } = useRecentActivities();
  const { data: repairReport, isLoading: repairLoading } = useRepairReports();

  const initialLoading =
    summaryLoading && monthlyLoading && activitiesLoading && repairLoading;

  useEffect(() => {
    if (!gridRef.current || initialLoading) return;
    void import("gsap").then(({ default: gsap }) => {
      gsap.from(gridRef.current!.children, {
        opacity: 0,
        y: 18,
        duration: 0.55,
        stagger: 0.07,
        ease: "power3.out",
      });
    });
  }, [initialLoading]);

  if (initialLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <ErrorBoundary fallbackTitle="Dashboard failed to load">
      <div ref={gridRef} className="space-y-6">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {mockStatCards.map((card) => (
            <StatCard key={card.title} data={card} />
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <StockStatusSection />
          <RecentActivitySection data={monthlySales} isLoading={monthlyLoading} />
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <SalesChannelsSection />
          <RepairReportsSection report={repairReport} isLoading={repairLoading} />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <ProductsTable />
          <ActivityTimeline items={activities} isLoading={activitiesLoading} />
        </section>
      </div>
    </ErrorBoundary>
  );
}
