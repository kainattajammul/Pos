"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import {
  formatBillingMoney,
  PAYMENT_STATUS_STYLES,
  type BillingInvoiceRow,
} from "@/lib/billing-types";
import { useBillingInvoices } from "@/hooks/use-billing";
import { cn } from "@/lib/utils";

const COLUMNS = [
  { key: "date", label: "Date", className: "min-w-[120px]" },
  { key: "amount", label: "Amount", className: "min-w-[100px]" },
  { key: "cycle", label: "Cycle", className: "min-w-[180px]" },
  { key: "productName", label: "Product Name", className: "min-w-[200px]" },
  { key: "type", label: "Type", className: "min-w-[120px]" },
  { key: "paymentStatus", label: "Payment Status", className: "min-w-[130px]" },
  { key: "action", label: "Action", className: "min-w-[80px]" },
] as const;

function InvoiceTableRow({ row }: { row: BillingInvoiceRow }) {
  return (
    <tr className="border-b border-[#E5E7EB] last:border-b-0 hover:bg-[#FAFAFA]">
      <td className="px-4 py-3.5 text-sm text-[#111827]">{row.date}</td>
      <td className="px-4 py-3.5 text-sm text-[#111827]">
        {formatBillingMoney(row.amount, row.currency)}
      </td>
      <td className="px-4 py-3.5 text-sm text-[#6B7280]">{row.cycle}</td>
      <td className="px-4 py-3.5 text-sm text-[#111827]">{row.productName}</td>
      <td className="px-4 py-3.5 text-sm text-[#6B7280]">{row.type}</td>
      <td className="px-4 py-3.5">
        <span
          className={cn(
            "text-sm",
            PAYMENT_STATUS_STYLES[row.paymentStatus],
          )}
        >
          {row.paymentStatus}
        </span>
      </td>
      <td className="px-4 py-3.5">
        <button
          type="button"
          onClick={() => toast.message(`Invoice ${row.id} — detail view when ready`)}
          className="text-sm font-medium text-[#31A5A6] transition-colors hover:text-[#227E7F] hover:underline"
        >
          View
        </button>
      </td>
    </tr>
  );
}

export function BillingInvoicesPage() {
  const { data: invoices = [], isLoading } = useBillingInvoices();

  return (
    <div className="mx-auto w-full max-w-[1100px] space-y-4 p-4 md:p-5">
      <header className="rounded-sm border border-[#E5E7EB] bg-white px-5 py-4 shadow-sm">
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-[#111827] md:text-2xl">Billing Invoices</h1>
          <nav className="text-sm text-[#6B7280]" aria-label="Breadcrumb">
            <Link
              href="/dashboard"
              className="font-medium text-[#31A5A6] transition-colors hover:text-[#227E7F] hover:underline"
            >
              Home
            </Link>
            <span className="mx-1.5 text-[#9CA3AF]">/</span>
            <Link
              href="/settings/billing"
              className="font-medium text-[#31A5A6] transition-colors hover:text-[#227E7F] hover:underline"
            >
              Settings
            </Link>
            <span className="mx-1.5 text-[#9CA3AF]">/</span>
            <span className="font-medium text-[#374151]">Billing Invoices</span>
          </nav>
        </div>
      </header>

      <section className="overflow-hidden rounded-sm border border-[#E5E7EB] bg-white shadow-sm">
        {isLoading ? (
          <div className="flex min-h-[280px] items-center justify-center">
            <Loader2 className="size-8 animate-spin text-(--repair-primary)" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-left">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-[#FAFAFA]">
                  {COLUMNS.map((col) => (
                    <th
                      key={col.key}
                      className={cn(
                        "px-4 py-3 text-xs font-medium uppercase tracking-wide text-[#9CA3AF]",
                        col.className,
                      )}
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invoices.length === 0 ? (
                  <tr>
                    <td
                      colSpan={COLUMNS.length}
                      className="px-4 py-16 text-center text-sm text-[#9CA3AF]"
                    >
                      暂无数据
                    </td>
                  </tr>
                ) : (
                  invoices.map((row) => <InvoiceTableRow key={row.id} row={row} />)
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
