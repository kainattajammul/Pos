"use client";

import { useEffect, useRef } from "react";
import {
  ActivityTimelineLazy,
  ProductsTableLazy,
  RecentActivitySectionLazy,
  RepairReportsSectionLazy,
  SalesChannelsSectionLazy,
  StatCardLazy,
  StockStatusSectionLazy,
} from "@/components/dashboard/dashboard-lazy";
import { StatCardsSkeleton } from "@/components/dashboard/stat-cards-skeleton";
import { ErrorBoundary } from "@/components/shared/error-boundary";
import {
  useDashboardSummary,
  useMonthlySales,
  useRecentActivities,
  useRepairReports,
} from "@/hooks/use-dashboard";
import { buildDashboardStatCards, mockDashboardSummary } from "@/lib/mock-data";

export default function DashboardPage() {
  const gridRef = useRef<HTMLDivElement>(null);
  const { data: summary = mockDashboardSummary, isLoading: summaryLoading } =
    useDashboardSummary();
  const statCards = buildDashboardStatCards(summary);
  const { data: monthlySales, isLoading: monthlyLoading } = useMonthlySales();
  const { data: activities, isLoading: activitiesLoading } = useRecentActivities();
  const { data: repairReport, isLoading: repairLoading } = useRepairReports();

  const statsReady = !summaryLoading;

  useEffect(() => {
    if (!gridRef.current || !statsReady) return;
    void import("gsap").then(({ default: gsap }) => {
      gsap.fromTo(
        gridRef.current!.children,
        { opacity: 0, y: 18 },
        {
          opacity: 1,
          y: 0,
          duration: 0.55,
          stagger: 0.07,
          ease: "power3.out",
          clearProps: "opacity,transform",
        },
      );
    });
  }, [statsReady]);

  return (
    <ErrorBoundary fallbackTitle="Dashboard failed to load">
      <div ref={gridRef} className="space-y-6">
        {statsReady ? (
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {statCards.map((card) => (
              <StatCardLazy key={card.title} data={card} />
            ))}
          </section>
        ) : (
          <StatCardsSkeleton />
        )}

        <section className="grid gap-6 lg:grid-cols-2">
          <StockStatusSectionLazy />
          <RecentActivitySectionLazy
            data={monthlySales}
            isLoading={monthlyLoading}
          />
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <SalesChannelsSectionLazy />
          <RepairReportsSectionLazy
            report={repairReport}
            isLoading={repairLoading}
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <ProductsTableLazy />
          <ActivityTimelineLazy
            items={activities}
            isLoading={activitiesLoading}
          />
        </section>
      </div>
    </ErrorBoundary>
  );
}
