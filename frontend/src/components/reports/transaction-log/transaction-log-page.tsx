"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Download, Loader2, RefreshCw, ScrollText } from "lucide-react";
import { toast } from "sonner";
import { RepairsTopNav } from "@/components/repairs/repairs-top-nav";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/hooks/use-auth";
import { useTransactionLog } from "@/hooks/use-transaction-log";
import {
  DEFAULT_ACTIVITY_LOG_FILTERS,
  formatActivityDate,
  matchesActivityLogFilters,
  type ActivityLogCategory,
  type ActivityLogFilters,
} from "@/lib/activity-log-types";
import { cn } from "@/lib/utils";
import { logActivityLogViewed } from "@/services/transaction-log.service";

const CATEGORY_OPTIONS: Array<{ value: ActivityLogCategory | "ALL"; label: string }> = [
  { value: "ALL", label: "All categories" },
  { value: "AUTH", label: "Authentication" },
  { value: "PROFILE", label: "Profile" },
  { value: "SALE", label: "Sales" },
  { value: "SHIFT", label: "Shift" },
  { value: "PAYMENT", label: "Payment" },
  { value: "SYSTEM", label: "System" },
];

const CATEGORY_STYLES: Record<ActivityLogCategory, string> = {
  AUTH: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  PROFILE: "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300",
  SALE: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  SHIFT: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
  PAYMENT: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  SYSTEM: "bg-[#F3F4F6] text-[#374151] dark:bg-white/10 dark:text-white/75",
};

const inputClass =
  "h-9 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 text-sm dark:border-white/10 dark:bg-[#16161c] dark:text-[#f4f4f5]";

export function TransactionLogPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const scope = searchParams.get("scope") === "mine" ? "mine" : "all";
  const { user } = useAuth();
  const { data: rows = [], isLoading, refetch, isFetching } = useTransactionLog(scope);

  const [draftFilters, setDraftFilters] = useState<ActivityLogFilters>({
    ...DEFAULT_ACTIVITY_LOG_FILTERS,
    employee: scope === "mine" && user ? user.name : "",
  });
  const [appliedFilters, setAppliedFilters] = useState<ActivityLogFilters | null>(null);
  const [pageSize, setPageSize] = useState(25);

  useEffect(() => {
    if (!user) return;
    logActivityLogViewed(user, scope);
    void refetch();
  }, [scope, user, refetch]);

  useEffect(() => {
    setDraftFilters((prev) => ({
      ...prev,
      employee: scope === "mine" && user ? user.name : prev.employee,
    }));
    if (scope === "mine" && user) {
      setAppliedFilters({
        ...DEFAULT_ACTIVITY_LOG_FILTERS,
        employee: user.name,
      });
    }
  }, [scope, user]);

  const filteredRows = useMemo(() => {
    if (!appliedFilters) return [];
    return rows.filter((row) => matchesActivityLogFilters(row, appliedFilters));
  }, [appliedFilters, rows]);

  const displayedRows = filteredRows.slice(0, pageSize);

  const handleRunReport = () => {
    setAppliedFilters({ ...draftFilters });
  };

  const handleReset = () => {
    const next = {
      ...DEFAULT_ACTIVITY_LOG_FILTERS,
      employee: scope === "mine" && user ? user.name : "",
    };
    setDraftFilters(next);
    setAppliedFilters(scope === "mine" && user ? next : null);
  };

  const handleExport = () => {
    if (filteredRows.length === 0) {
      toast.error("Run the report first or adjust filters to export entries.");
      return;
    }
    toast.success(`Prepared ${filteredRows.length} activity log entries for export`);
  };

  return (
    <div className="repairs-pos-theme flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-pos-page">
      <RepairsTopNav />
      <main className="flex-1 overflow-auto">
        <div className="mx-auto w-full max-w-[1600px] space-y-4 p-4 md:p-5">
          <nav className="pos-breadcrumb" aria-label="Breadcrumb">
            <Link href="/dashboard">Home</Link>
            <span className="mx-1.5 text-pos-subtle">/</span>
            <Link href="/reports/store-dashboard">Reports</Link>
            <span className="mx-1.5 text-pos-subtle">/</span>
            <span className="font-medium text-pos-secondary">
              {scope === "mine" ? "My Activity Log" : "Transaction Log"}
            </span>
          </nav>

          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <ScrollText className="size-6 text-(--repair-primary)" />
                <h1 className="text-xl font-bold text-pos md:text-2xl">
                  {scope === "mine" ? "My Activity Log" : "Transaction Log"}
                </h1>
              </div>
              <p className="mt-1 text-sm text-pos-muted">
                {scope === "mine"
                  ? `Showing account activity for ${user?.name ?? "current user"}.`
                  : "Track employee actions, sales events, shifts, and system changes."}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {scope === "mine" ? (
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-lg dark:border-white/10 dark:bg-[#16161c]"
                  onClick={() => router.push("/profile")}
                >
                  Back to Profile
                </Button>
              ) : null}
              <Button
                type="button"
                variant="outline"
                className="rounded-lg dark:border-white/10 dark:bg-[#16161c]"
                onClick={() => void refetch()}
              >
                <RefreshCw className={cn("size-4", isFetching && "animate-spin")} />
                Refresh
              </Button>
              <Button
                type="button"
                className="rounded-lg bg-(--repair-primary) text-white hover:opacity-90"
                onClick={handleExport}
              >
                <Download className="size-4" />
                Export
              </Button>
            </div>
          </div>

          <section className="pos-panel space-y-4 p-4 md:p-5">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide text-pos-muted">
                  Search
                </label>
                <input
                  value={draftFilters.search}
                  onChange={(e) =>
                    setDraftFilters((prev) => ({ ...prev, search: e.target.value }))
                  }
                  placeholder="Action, description, reference"
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide text-pos-muted">
                  Category
                </label>
                <select
                  value={draftFilters.category}
                  onChange={(e) =>
                    setDraftFilters((prev) => ({
                      ...prev,
                      category: e.target.value as ActivityLogFilters["category"],
                    }))
                  }
                  className={inputClass}
                >
                  {CATEGORY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide text-pos-muted">
                  Employee
                </label>
                <input
                  value={draftFilters.employee}
                  onChange={(e) =>
                    setDraftFilters((prev) => ({ ...prev, employee: e.target.value }))
                  }
                  placeholder="Name or email"
                  className={inputClass}
                  disabled={scope === "mine"}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide text-pos-muted">
                  Date from
                </label>
                <input
                  type="date"
                  value={draftFilters.dateFrom}
                  onChange={(e) =>
                    setDraftFilters((prev) => ({ ...prev, dateFrom: e.target.value }))
                  }
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide text-pos-muted">
                  Date to
                </label>
                <input
                  type="date"
                  value={draftFilters.dateTo}
                  onChange={(e) =>
                    setDraftFilters((prev) => ({ ...prev, dateTo: e.target.value }))
                  }
                  className={inputClass}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                className="rounded-lg bg-(--repair-primary) text-white hover:opacity-90"
                onClick={handleRunReport}
              >
                Run Report
              </Button>
              <Button
                type="button"
                variant="outline"
                className="rounded-lg dark:border-white/10 dark:bg-[#16161c]"
                onClick={handleReset}
              >
                Reset
              </Button>
            </div>
          </section>

          <section className="pos-table-shell">
            <div className="flex items-center justify-between border-b border-pos px-4 py-2.5">
              <p className="text-sm text-pos-muted">
                {appliedFilters
                  ? `${filteredRows.length} entr${filteredRows.length === 1 ? "y" : "ies"}`
                  : "Run the report to load activity entries"}
              </p>
              <label className="relative">
                <select
                  value={String(pageSize)}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="pos-input h-8 appearance-none rounded-sm py-1 pl-3 pr-8 text-xs font-medium"
                  aria-label="Rows per page"
                >
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </label>
            </div>

            {isLoading ? (
              <div className="flex min-h-[240px] items-center justify-center">
                <Loader2 className="size-8 animate-spin text-(--repair-primary)" />
              </div>
            ) : !appliedFilters ? (
              <div className="flex min-h-[240px] items-center justify-center px-4 text-sm text-pos-muted">
                Use the filters above and click Run Report to view activity entries.
              </div>
            ) : filteredRows.length === 0 ? (
              <div className="flex min-h-[240px] items-center justify-center px-4 text-sm text-pos-muted">
                No activity entries match your filters.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-pos-table-header hover:bg-pos-table-header">
                      <TableHead className="min-w-[160px]">Date & Time</TableHead>
                      <TableHead className="min-w-[140px]">Employee</TableHead>
                      <TableHead className="min-w-[110px]">Category</TableHead>
                      <TableHead className="min-w-[140px]">Action</TableHead>
                      <TableHead className="min-w-[260px]">Description</TableHead>
                      <TableHead className="min-w-[120px]">Reference</TableHead>
                      <TableHead className="min-w-[120px]">IP Address</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayedRows.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="text-sm text-pos-secondary">
                          {formatActivityDate(row.createdAt)}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium text-pos">{row.userName}</div>
                          <div className="text-xs text-pos-muted">{row.email}</div>
                        </TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                              CATEGORY_STYLES[row.category],
                            )}
                          >
                            {row.category}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm font-medium text-pos">
                          {row.action}
                        </TableCell>
                        <TableCell className="text-sm text-pos-secondary">
                          {row.description}
                        </TableCell>
                        <TableCell className="text-sm text-pos-muted">
                          {row.reference ?? "—"}
                        </TableCell>
                        <TableCell className="text-sm text-pos-muted">
                          {row.ipAddress ?? "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
