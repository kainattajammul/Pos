"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartCardSkeleton, DonutCardSkeleton } from "./chart-card-skeleton";

export const StatCardLazy = dynamic(
  () => import("./stat-card").then((m) => ({ default: m.StatCard })),
  { loading: () => <Skeleton className="h-[140px] rounded-2xl" /> },
);

export const StockStatusSectionLazy = dynamic(
  () =>
    import("./stock-status-section").then((m) => ({
      default: m.StockStatusSection,
    })),
  { loading: () => <DonutCardSkeleton /> },
);

export const RecentActivitySectionLazy = dynamic(
  () =>
    import("./recent-activity-section").then((m) => ({
      default: m.RecentActivitySection,
    })),
  { loading: () => <ChartCardSkeleton titleWidth="w-40" /> },
);

export const SalesChannelsSectionLazy = dynamic(
  () =>
    import("./sales-channels-section").then((m) => ({
      default: m.SalesChannelsSection,
    })),
  { loading: () => <DonutCardSkeleton /> },
);

export const RepairReportsSectionLazy = dynamic(
  () =>
    import("./repair-reports-section").then((m) => ({
      default: m.RepairReportsSection,
    })),
  { loading: () => <DonutCardSkeleton /> },
);

export const ProductsTableLazy = dynamic(
  () =>
    import("@/components/tables/products-table").then((m) => ({
      default: m.ProductsTable,
    })),
  { ssr: false, loading: () => <Skeleton className="h-[420px] rounded-2xl" /> },
);

export const ActivityTimelineLazy = dynamic(
  () =>
    import("./activity-timeline").then((m) => ({
      default: m.ActivityTimeline,
    })),
  { loading: () => <Skeleton className="h-[360px] rounded-2xl" /> },
);
