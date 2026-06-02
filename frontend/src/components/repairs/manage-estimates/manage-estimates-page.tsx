"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { RepairsTopNav } from "@/components/repairs/repairs-top-nav";
import { NEW_ESTIMATES_STORAGE_KEY } from "@/components/repairs/manage-estimates/create-estimate-utils";
import { EstimateHeaderActions } from "@/components/repairs/manage-estimates/estimate-header-actions";
import { EstimateFilters } from "@/components/repairs/manage-estimates/estimate-filters";
import { EstimatesTable } from "@/components/repairs/manage-estimates/estimates-table";
import {
  ESTIMATE_DATE_TABS,
} from "@/components/repairs/manage-estimates/estimate-date-tabs";
import type {
  EstimateFiltersState,
  EstimateRecord,
} from "@/components/repairs/manage-estimates/manage-estimates-types";

const DEFAULT_FILTERS: EstimateFiltersState = {
  estimateId: "",
  customerName: "",
  customerEmail: "",
  createdDateFrom: "Jul-25-2025",
  createdDateTo: "Jul-25-2025",
  status: "",
  advanceFilter: "",
};

const MOCK_ESTIMATES: EstimateRecord[] = [];

function parseLooseDate(value: string): Date | null {
  if (!value) return null;
  const normalized = value.replace(/-/g, " ");
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function withinTab(date: Date, tab: (typeof ESTIMATE_DATE_TABS)[number]): boolean {
  const now = new Date();
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dayEnd = new Date(dayStart);
  dayEnd.setHours(23, 59, 59, 999);
  const yesterdayStart = new Date(dayStart);
  yesterdayStart.setDate(dayStart.getDate() - 1);
  const yesterdayEnd = new Date(yesterdayStart);
  yesterdayEnd.setHours(23, 59, 59, 999);
  const sevenDaysAgo = new Date(dayStart);
  sevenDaysAgo.setDate(dayStart.getDate() - 7);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
  const yearStart = new Date(now.getFullYear(), 0, 1);

  switch (tab) {
    case "Today":
      return date >= dayStart && date <= dayEnd;
    case "Yesterday":
      return date >= yesterdayStart && date <= yesterdayEnd;
    case "Last 7 Days":
      return date >= sevenDaysAgo && date <= dayEnd;
    case "This Month":
      return date >= monthStart;
    case "Last Month":
      return date >= lastMonthStart && date <= lastMonthEnd;
    case "This Year":
      return date >= yearStart;
    case "All":
      return true;
  }
}

function loadStoredEstimates(): EstimateRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(NEW_ESTIMATES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as EstimateRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function ManageEstimatesPage() {
  const router = useRouter();
  const [estimates, setEstimates] = useState<EstimateRecord[]>(MOCK_ESTIMATES);
  const [draftFilters, setDraftFilters] = useState<EstimateFiltersState>(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<EstimateFiltersState>(DEFAULT_FILTERS);
  const [activeDateTab, setActiveDateTab] =
    useState<(typeof ESTIMATE_DATE_TABS)[number]>("Today");
  const [pageSize, setPageSize] = useState(25);

  useEffect(() => {
    const stored = loadStoredEstimates();
    if (stored.length === 0) return;
    setEstimates((prev) => {
      const ids = new Set(prev.map((row) => row.id));
      const novel = stored.filter((row) => !ids.has(row.id));
      return [...novel, ...prev];
    });
    sessionStorage.removeItem(NEW_ESTIMATES_STORAGE_KEY);
  }, []);

  const filteredRows = useMemo(() => {
    const from = parseLooseDate(appliedFilters.createdDateFrom);
    const to = parseLooseDate(appliedFilters.createdDateTo);

    return estimates
      .filter((row) => {
        const rowDate = new Date(row.createdDate);
        if (!withinTab(rowDate, activeDateTab)) return false;
        if (from && rowDate < from) return false;
        if (to) {
          const inclusiveTo = new Date(to);
          inclusiveTo.setHours(23, 59, 59, 999);
          if (rowDate > inclusiveTo) return false;
        }
        if (
          appliedFilters.estimateId &&
          !row.id.toLowerCase().includes(appliedFilters.estimateId.toLowerCase())
        )
          return false;
        if (
          appliedFilters.customerName &&
          !row.customer.toLowerCase().includes(appliedFilters.customerName.toLowerCase())
        )
          return false;
        if (
          appliedFilters.customerEmail &&
          !row.customerEmail.toLowerCase().includes(appliedFilters.customerEmail.toLowerCase())
        )
          return false;
        if (appliedFilters.status && row.status !== appliedFilters.status) return false;
        return true;
      })
      .slice(0, pageSize);
  }, [activeDateTab, appliedFilters, estimates, pageSize]);

  return (
    <div className="repairs-pos-theme flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-[#F8FAFC]">
      <RepairsTopNav />
      <div className="min-h-0 flex-1 overflow-auto">
        <div className="mx-auto w-full max-w-[1600px] p-4 md:p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-2xl font-semibold text-[#111827]">Manage Estimates</h1>
            <EstimateHeaderActions
              onCreateEstimate={() => router.push("/repairs/manage-estimates/create")}
            />
          </div>

          <EstimateFilters
            value={draftFilters}
            onChange={setDraftFilters}
            onSearch={() => setAppliedFilters(draftFilters)}
            onReset={() => {
              setDraftFilters(DEFAULT_FILTERS);
              setAppliedFilters(DEFAULT_FILTERS);
              setActiveDateTab("Today");
            }}
          />

          <div className="mt-3">
            <EstimatesTable
              rows={filteredRows}
              activeDateTab={activeDateTab}
              onDateTabChange={setActiveDateTab}
              pageSize={pageSize}
              onPageSizeChange={setPageSize}
            />
          </div>
        </div>
      </div>

    </div>
  );
}
