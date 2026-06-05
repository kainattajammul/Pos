"use client";

import { useMemo, useState } from "react";
import { Download, Plus } from "lucide-react";
import { RepairsTopNav } from "@/components/repairs/repairs-top-nav";
import { Button } from "@/components/ui/button";
import { InquiryActionDropdown } from "@/components/repairs/manage-inquiries/inquiry-action-dropdown";
import { InquiryFilters } from "@/components/repairs/manage-inquiries/inquiry-filters";
import { InquirySummaryCards } from "@/components/repairs/manage-inquiries/inquiry-summary-cards";
import { InquiryResultsTable } from "@/components/repairs/manage-inquiries/inquiry-results-table";
import { CreateInquiryModal } from "@/components/repairs/manage-inquiries/create-inquiry-modal";
import type {
  InquiryFiltersState,
  InquiryRecord,
} from "@/components/repairs/manage-inquiries/manage-inquiries-types";
import { INQUIRY_DATE_TABS } from "@/components/repairs/manage-inquiries/inquiry-date-tabs";

const DEFAULT_FILTERS: InquiryFiltersState = {
  inquiryId: "",
  customerName: "Soft Access",
  createdDateRange: "01 Jun, 2025 - 30 Jun, 2025",
  inquiryStatus: "New",
  selectCriteria: "Ticket ID",
  criteriaValue: "03285",
  hideClosedInquiries: false,
};

const MOCK_INQUIRIES: InquiryRecord[] = [
  {
    id: "INQ-0001",
    inquiryId: "INQ-0001",
    customerName: "Soft Access",
    reference: "Ticket ID 03285",
    inquiryValue: 0,
    assignedTo: "Faisal Sheikh",
    createdDate: "2025-06-21",
    status: "New",
    ticketId: "03285",
  },
  {
    id: "INQ-0002",
    inquiryId: "INQ-0002",
    customerName: "Walkin Customer",
    reference: "Ticket ID 03281",
    inquiryValue: 45,
    assignedTo: "Admin User",
    createdDate: "2025-06-18",
    status: "Open",
    ticketId: "03281",
  },
  {
    id: "INQ-0003",
    inquiryId: "INQ-0003",
    customerName: "Soft Access",
    reference: "Ticket ID 03279",
    inquiryValue: 30,
    assignedTo: "Repair Staff",
    createdDate: "2025-06-05",
    status: "Closed",
    ticketId: "03279",
  },
];

function parseDateRange(range: string): { start?: Date; end?: Date } {
  const parts = range.split("-").map((s) => s.trim());
  if (parts.length !== 2) return {};
  const start = new Date(parts[0]);
  const end = new Date(parts[1]);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return {};
  return { start, end };
}

function matchesQuickDateTab(date: Date, tab: (typeof INQUIRY_DATE_TABS)[number]): boolean {
  const now = new Date();
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(dayStart);
  yesterdayStart.setDate(dayStart.getDate() - 1);
  const sevenDaysAgo = new Date(dayStart);
  sevenDaysAgo.setDate(dayStart.getDate() - 7);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const thisYearStart = new Date(now.getFullYear(), 0, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
  const dayEnd = new Date(dayStart);
  dayEnd.setHours(23, 59, 59, 999);
  const yesterdayEnd = new Date(yesterdayStart);
  yesterdayEnd.setHours(23, 59, 59, 999);

  switch (tab) {
    case "TODAY":
      return date >= dayStart && date <= dayEnd;
    case "YESTERDAY":
      return date >= yesterdayStart && date <= yesterdayEnd;
    case "LAST 7 DAYS":
      return date >= sevenDaysAgo && date <= dayEnd;
    case "THIS MONTH":
      return date >= monthStart;
    case "LAST MONTH":
      return date >= lastMonthStart && date <= lastMonthEnd;
    case "THIS YEAR":
      return date >= thisYearStart;
    case "ALL":
      return true;
  }
}

export function ManageInquiriesPage() {
  const [inquiries, setInquiries] = useState<InquiryRecord[]>(MOCK_INQUIRIES);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [draftFilters, setDraftFilters] = useState<InquiryFiltersState>(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<InquiryFiltersState>(DEFAULT_FILTERS);
  const [activeDateTab, setActiveDateTab] =
    useState<(typeof INQUIRY_DATE_TABS)[number]>("LAST MONTH");
  const [pageSize, setPageSize] = useState(50);

  const filteredRows = useMemo(() => {
    const { start, end } = parseDateRange(appliedFilters.createdDateRange);

    const rows = inquiries.filter((row) => {
      const rowDate = new Date(row.createdDate);
      if (!matchesQuickDateTab(rowDate, activeDateTab)) return false;
      if (start && rowDate < start) return false;
      if (end) {
        const inclusiveEnd = new Date(end);
        inclusiveEnd.setHours(23, 59, 59, 999);
        if (rowDate > inclusiveEnd) return false;
      }
      if (appliedFilters.hideClosedInquiries && row.status === "Closed") return false;
      if (appliedFilters.inquiryStatus !== "All" && row.status !== appliedFilters.inquiryStatus)
        return false;
      if (
        appliedFilters.inquiryId &&
        !row.inquiryId.toLowerCase().includes(appliedFilters.inquiryId.toLowerCase())
      ) {
        return false;
      }
      if (
        appliedFilters.customerName &&
        !row.customerName.toLowerCase().includes(appliedFilters.customerName.toLowerCase())
      ) {
        return false;
      }
      if (appliedFilters.criteriaValue) {
        if (
          appliedFilters.selectCriteria === "Ticket ID" &&
          !row.ticketId.toLowerCase().includes(appliedFilters.criteriaValue.toLowerCase())
        ) {
          return false;
        }
        if (
          appliedFilters.selectCriteria === "Inquiry ID" &&
          !row.inquiryId.toLowerCase().includes(appliedFilters.criteriaValue.toLowerCase())
        ) {
          return false;
        }
      }
      return true;
    });

    return rows.slice(0, pageSize);
  }, [appliedFilters, activeDateTab, inquiries, pageSize]);

  const summary = useMemo(() => {
    const source = filteredRows;
    const newInquiries = source.filter((r) => r.status === "New").length;
    const openInquiries = source.filter((r) => r.status === "Open").length;
    const closedInquiries = source.filter((r) => r.status === "Closed").length;
    const cancelledInquiries = source.filter((r) => r.status === "Cancelled").length;
    const totalValueCreated = source.reduce((sum, r) => sum + r.inquiryValue, 0);
    const totalValueClosed = source
      .filter((r) => r.status === "Closed")
      .reduce((sum, r) => sum + r.inquiryValue, 0);
    return {
      newInquiries,
      openInquiries,
      closedInquiries,
      cancelledInquiries,
      totalValueCreated,
      totalValueClosed,
    };
  }, [filteredRows]);

  return (
    <div className="repairs-pos-theme flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-pos-page">
      <RepairsTopNav />
      <div className="min-h-0 flex-1 overflow-auto">
        <div className="mx-auto w-full max-w-[1600px] p-4 md:p-5">
          <div className="mb-2 text-sm text-[#6B7280]">
            <span className="text-[#31A5A6]">Home</span> / Manage Inquiries
          </div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-3xl font-semibold tracking-tight text-[#111827]">
              Manage Inquiries
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                className="h-9 rounded-md border-[#E5E7EB] bg-white px-3 text-sm font-medium text-[#374151] hover:bg-pos-page"
              >
                <Download className="size-4 text-[#7AAE85]" />
                Export
              </Button>
              <Button
                type="button"
                className="h-9 rounded-md border-0 bg-(--repair-primary) px-3 text-sm font-semibold text-(--repair-on-primary) hover:opacity-90"
                onClick={() => setCreateModalOpen(true)}
              >
                <Plus className="size-4" />
                Create Inquiry
              </Button>
              <InquiryActionDropdown />
            </div>
          </div>

          <InquiryFilters
            value={draftFilters}
            onChange={setDraftFilters}
            onSearch={() => setAppliedFilters(draftFilters)}
            onReset={() => {
              setDraftFilters(DEFAULT_FILTERS);
              setAppliedFilters(DEFAULT_FILTERS);
              setActiveDateTab("LAST MONTH");
            }}
          />

          <div className="mt-4">
            <InquirySummaryCards {...summary} />
          </div>

          <div className="mt-4">
            <InquiryResultsTable
              rows={filteredRows}
              periodLabel="01 Jun, 2025 to 30 Jun, 2025"
              activeDateTab={activeDateTab}
              onDateTabChange={setActiveDateTab}
              pageSize={pageSize}
              onPageSizeChange={setPageSize}
            />
          </div>
        </div>
      </div>
      <CreateInquiryModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onCreateInquiry={(inquiry) => {
          setInquiries((prev) => [inquiry, ...prev]);
        }}
      />
    </div>
  );
}
