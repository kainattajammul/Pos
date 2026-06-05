"use client";

import { useMemo, useState } from "react";
import { RepairsTopNav } from "@/components/repairs/repairs-top-nav";
import { InvoiceFilters } from "@/components/repairs/manage-invoices/invoice-filters";
import { InvoiceStatsCards } from "@/components/repairs/manage-invoices/invoice-stats-cards";
import { InvoiceInsights } from "@/components/repairs/manage-invoices/invoice-insights";
import { InvoiceTable } from "@/components/repairs/manage-invoices/invoice-table";
import type {
  InvoiceDateTab,
  InvoiceFiltersState,
  InvoiceRecord,
  InvoiceStats,
} from "@/components/repairs/manage-invoices/manage-invoices-types";

const DEFAULT_FILTERS: InvoiceFiltersState = {
  customerName: "",
  invoiceId: "",
  invoiceStatus: "",
  employee: "",
  createdDate: "",
  paymentDate: "",
  selectCriteria: "",
  criteriaValue: "",
};

const MOCK_INVOICES: InvoiceRecord[] = [];

function parseLooseDate(value: string): Date | null {
  if (!value.trim()) return null;
  const date = new Date(value.replace(/-/g, " "));
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function matchesDateTab(date: Date, tab: InvoiceDateTab): boolean {
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

function computeStats(rows: InvoiceRecord[]): InvoiceStats {
  const totalSales = rows.reduce((sum, r) => sum + r.total, 0);
  const totalInvoices = rows.length;
  const totalTax = rows.reduce((sum, r) => sum + r.total * 0.2, 0);
  const totalRefunds = rows
    .filter((r) => r.invoiceStatus === "Refunded")
    .reduce((sum, r) => sum + r.total, 0);
  const accountReceivable = rows.reduce((sum, r) => sum + r.due, 0);

  return {
    totalSales,
    totalInvoices,
    totalTax,
    totalRefunds,
    accountReceivable,
    totalAccountReceivable: accountReceivable,
  };
}

const EMPTY_STATS: InvoiceStats = {
  totalSales: 0,
  totalInvoices: 0,
  totalTax: 0,
  totalRefunds: 0,
  accountReceivable: 0,
  totalAccountReceivable: 0,
};

export function ManageInvoicesPage() {
  const [invoices] = useState<InvoiceRecord[]>(MOCK_INVOICES);
  const [filters, setFilters] = useState<InvoiceFiltersState>(DEFAULT_FILTERS);
  const [activeDateTab, setActiveDateTab] = useState<InvoiceDateTab>("Today");
  const [insightsPinned, setInsightsPinned] = useState(true);

  const filteredRows = useMemo(() => {
    return invoices.filter((row) => {
      const rowDate = new Date(row.createdDate);
      if (!matchesDateTab(rowDate, activeDateTab)) return false;

      if (
        filters.customerName &&
        !row.customer.toLowerCase().includes(filters.customerName.toLowerCase())
      ) {
        return false;
      }
      if (
        filters.invoiceId &&
        !row.id.toLowerCase().includes(filters.invoiceId.toLowerCase())
      ) {
        return false;
      }
      if (filters.invoiceStatus && row.invoiceStatus !== filters.invoiceStatus) {
        return false;
      }
      if (filters.employee && row.employee !== filters.employee) {
        return false;
      }

      const created = parseLooseDate(filters.createdDate);
      if (created) {
        const rowOnly = new Date(row.createdDate);
        if (rowOnly < created) return false;
      }

      if (filters.paymentDate && row.paymentDate !== filters.paymentDate) {
        return false;
      }

      if (filters.selectCriteria && filters.criteriaValue) {
        const v = filters.criteriaValue.toLowerCase();
        if (filters.selectCriteria === "Reference" && !row.reference.toLowerCase().includes(v)) {
          return false;
        }
        if (filters.selectCriteria === "Customer" && !row.customer.toLowerCase().includes(v)) {
          return false;
        }
        if (
          filters.selectCriteria === "Organization" &&
          !row.organization.toLowerCase().includes(v)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [activeDateTab, filters, invoices]);

  const stats = useMemo(
    () => (filteredRows.length === 0 ? EMPTY_STATS : computeStats(filteredRows)),
    [filteredRows],
  );

  return (
    <div className="repairs-pos-theme flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-pos-page">
      <RepairsTopNav />
      <div className="min-h-0 flex-1 overflow-auto">
        <div className="mx-auto w-full max-w-[1600px] p-4 md:p-5">
          <h1 className="mb-4 text-2xl font-semibold text-[#111827]">Manage Invoices</h1>

          <InvoiceFilters value={filters} onChange={setFilters} />

          <div className="mt-4">
            <InvoiceStatsCards stats={stats} />
          </div>

          <div className="mt-4">
            <InvoiceInsights
              stats={stats}
              insightsPinned={insightsPinned}
              onTogglePin={() => setInsightsPinned((v) => !v)}
            />
          </div>

          <div className="mt-4">
            <InvoiceTable
              rows={filteredRows}
              activeDateTab={activeDateTab}
              onDateTabChange={setActiveDateTab}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
