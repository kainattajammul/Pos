"use client";

import { useMemo, useRef, useState } from "react";
import { RepairsTopNav } from "@/components/repairs/repairs-top-nav";
import { LeadHeaderActions } from "@/components/repairs/manage-leads/lead-header-actions";
import { LeadInsightCards } from "@/components/repairs/manage-leads/lead-insight-cards";
import { LeadDateFilters } from "@/components/repairs/manage-leads/lead-date-filters";
import { LeadTable } from "@/components/repairs/manage-leads/lead-table";
import { WalkInCustomerForm } from "@/components/repairs/manage-leads/walk-in-customer-form";
import { LeadSearchFilterPanel } from "@/components/repairs/manage-leads/lead-search-filter-panel";
import type {
  LeadDateTab,
  LeadRecord,
  LeadStats,
  ReferralSource,
  WalkInCustomerFormState,
} from "@/components/repairs/manage-leads/manage-leads-types";
import { DEFAULT_WALK_IN_CUSTOMER } from "@/components/repairs/manage-leads/manage-leads-types";

const MOCK_LEADS: LeadRecord[] = [];

const EMPTY_STATS: LeadStats = {
  won: 0,
  lost: 0,
  openLeads: 0,
  inProgress: 0,
  expired: 0,
  canceled: 0,
  referralCounts: {
    "Face Book": 0,
    Bing: 0,
    "Search Bing": 0,
    "Google Ads": 0,
    Others: 0,
  },
  totalValueAllLeads: 0,
  leadsWonValue: 0,
};

function formatPeriodLabel(tab: LeadDateTab): string {
  const now = new Date();
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let start = new Date(dayStart);

  switch (tab) {
    case "Today":
      break;
    case "30 days":
      start.setDate(start.getDate() - 30);
      break;
    case "7 days":
      start.setDate(start.getDate() - 7);
      break;
    case "12 month":
      start = new Date(now.getFullYear(), now.getMonth() - 11, 1);
      break;
  }

  return `${fmt(start)} to ${fmt(dayStart)}`;
}

function matchesDateTab(date: Date, tab: LeadDateTab): boolean {
  const now = new Date();
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dayEnd = new Date(dayStart);
  dayEnd.setHours(23, 59, 59, 999);

  switch (tab) {
    case "Today":
      return date >= dayStart && date <= dayEnd;
    case "30 days": {
      const start = new Date(dayStart);
      start.setDate(start.getDate() - 30);
      return date >= start && date <= dayEnd;
    }
    case "7 days": {
      const start = new Date(dayStart);
      start.setDate(start.getDate() - 7);
      return date >= start && date <= dayEnd;
    }
    case "12 month": {
      const start = new Date(now.getFullYear(), now.getMonth() - 11, 1);
      return date >= start;
    }
    default:
      return true;
  }
}

function computeStats(rows: LeadRecord[]): LeadStats {
  const referralSources: ReferralSource[] = [
    "Face Book",
    "Bing",
    "Search Bing",
    "Google Ads",
    "Others",
  ];
  const referralCounts = referralSources.reduce(
    (acc, src) => {
      acc[src] = rows.filter((r) => r.referralSource === src).length;
      return acc;
    },
    {} as Record<ReferralSource, number>,
  );

  const sumByStatus = (status: LeadRecord["status"]) =>
    rows.filter((r) => r.status === status).reduce((s, r) => s + r.total, 0);

  return {
    won: sumByStatus("Won"),
    lost: sumByStatus("Lost"),
    openLeads: sumByStatus("Open"),
    inProgress: sumByStatus("In progress"),
    expired: sumByStatus("Expired"),
    canceled: sumByStatus("Canceled"),
    referralCounts,
    totalValueAllLeads: rows.reduce((s, r) => s + r.total, 0),
    leadsWonValue: sumByStatus("Won"),
  };
}

export function ManageLeadsPage() {
  const [leads] = useState<LeadRecord[]>(MOCK_LEADS);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterCustomer, setFilterCustomer] = useState("");
  const [filterLeadId, setFilterLeadId] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [quickDateTab, setQuickDateTab] = useState<LeadDateTab>("Today");
  const [tableDateTab, setTableDateTab] = useState<LeadDateTab>("Today");
  const [walkInCustomer, setWalkInCustomer] =
    useState<WalkInCustomerFormState>(DEFAULT_WALK_IN_CUSTOMER);

  const customerFormRef = useRef<HTMLElement>(null);

  const filteredRows = useMemo(() => {
    const tab = tableDateTab;
    return leads.filter((row) => {
      const rowDate = new Date(row.createdDate);
      if (!matchesDateTab(rowDate, tab)) return false;
      if (
        filterCustomer &&
        !row.customer.toLowerCase().includes(filterCustomer.toLowerCase())
      ) {
        return false;
      }
      if (filterLeadId && !row.id.toLowerCase().includes(filterLeadId.toLowerCase())) {
        return false;
      }
      if (filterStatus && row.status !== filterStatus) return false;
      return true;
    });
  }, [filterCustomer, filterLeadId, filterStatus, leads, tableDateTab]);

  const stats = useMemo(
    () => (filteredRows.length === 0 ? EMPTY_STATS : computeStats(filteredRows)),
    [filteredRows],
  );

  const periodLabel = formatPeriodLabel(quickDateTab);

  const scrollToCustomerForm = () => {
    customerFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="repairs-pos-theme flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-pos-page">
      <RepairsTopNav />
      <div className="min-h-0 flex-1 overflow-auto">
        <div className="mx-auto w-full max-w-[1600px] p-4 md:p-5">
          <h1 className="mb-3 text-2xl font-semibold text-[#111827]">Manage Leads</h1>

          <LeadHeaderActions
            filterOpen={filterOpen}
            onToggleFilter={() => setFilterOpen((v) => !v)}
            onNewLeads={scrollToCustomerForm}
          />

          {filterOpen ? (
            <div className="mt-3">
              <LeadSearchFilterPanel
                customerName={filterCustomer}
                leadId={filterLeadId}
                status={filterStatus}
                onCustomerNameChange={setFilterCustomer}
                onLeadIdChange={setFilterLeadId}
                onStatusChange={setFilterStatus}
              />
            </div>
          ) : null}

          <div className="mt-4">
            <LeadInsightCards stats={stats} />
          </div>

          <div className="mt-4">
            <LeadDateFilters
              periodLabel={periodLabel}
              activeQuickTab={quickDateTab}
              onQuickTabChange={(tab) => {
                setQuickDateTab(tab);
                setTableDateTab(tab);
              }}
            />
          </div>

          <div className="mt-4">
            <LeadTable
              rows={filteredRows}
              activeDateTab={tableDateTab}
              onDateTabChange={setTableDateTab}
            />
          </div>

          <div className="mt-4">
            <WalkInCustomerForm
              ref={customerFormRef}
              value={walkInCustomer}
              onChange={setWalkInCustomer}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
