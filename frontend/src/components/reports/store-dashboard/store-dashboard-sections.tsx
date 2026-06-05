"use client";

import { useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChevronDown,
  ChevronUp,
  GripVertical,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChartContainer } from "@/components/charts/chart-container";
import { DonutChart } from "@/components/charts/donut-chart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  exportDailySalesCsv,
  formatDashboardDate,
  formatDashboardDateTime,
  formatDateRangeLabel,
  formatMoney,
  formatPercent,
  MOCK_SALES_BY_ITEM_TYPE,
  type DailySaleRow,
  type PaymentMethodSummary,
  type RepairTicketRow,
  type SalesByItemTypeRow,
} from "@/components/reports/store-dashboard/store-dashboard-types";

function CollapsibleCard({
  title,
  viewReportHref,
  children,
  defaultOpen = true,
}: {
  title: string;
  viewReportHref?: string;
  children?: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="overflow-hidden rounded-sm border border-[#E5E7EB] bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-[#E5E7EB] px-3 py-2.5">
        <GripVertical className="size-4 shrink-0 text-[#D1D5DB]" aria-hidden />
        <h2 className="min-w-0 flex-1 text-sm font-semibold text-[#111827]">{title}</h2>
        {viewReportHref ? (
          <Button
            render={<Link href={viewReportHref} />}
            nativeButton={false}
            className="h-7 rounded-sm border-0 bg-(--repair-primary) px-3 text-xs font-semibold text-(--repair-on-primary) hover:opacity-90"
          >
            View Report
          </Button>
        ) : null}
        <button
          type="button"
          className="ml-1 rounded p-1 text-[#6B7280] hover:bg-[#F3F4F6]"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? `Collapse ${title}` : `Expand ${title}`}
        >
          {open ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
        </button>
      </div>
      {open && children ? <div className="p-0">{children}</div> : null}
    </section>
  );
}

interface SalesByItemTypeSectionProps {
  data?: SalesByItemTypeRow[];
}

export function SalesByItemTypeSection({
  data = MOCK_SALES_BY_ITEM_TYPE,
}: SalesByItemTypeSectionProps) {
  return (
    <CollapsibleCard title="Sales By Item Type" viewReportHref="/reports/sales-by-item-type">
      <div className="p-4">
        <ChartContainer height={220}>
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <BarChart data={data} barSize={28} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
              <XAxis
                dataKey="type"
                tick={{ fontSize: 11, fill: "#6B7280" }}
                axisLine={{ stroke: "#E5E7EB" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#6B7280" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `£${v}`}
              />
              <Tooltip
                formatter={(value) => [formatMoney(Number(value ?? 0)), "Sales"]}
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid #E5E7EB",
                  background: "#fff",
                  fontSize: 12,
                }}
              />
              <Bar
                dataKey="sales"
                fill="var(--repair-primary)"
                radius={[4, 4, 0, 0]}
                fillOpacity={0.85}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </CollapsibleCard>
  );
}

interface DailySalesSectionProps {
  rows: DailySaleRow[];
  period: { start: Date; end: Date };
}

export function DailySalesSection({ rows, period }: DailySalesSectionProps) {
  const periodLabel = formatDateRangeLabel(period.start, period.end);

  const totals = rows.reduce(
    (acc, row) => ({
      sale: acc.sale + row.sale,
      cogs: acc.cogs + row.cogs,
      netProfit: acc.netProfit + row.netProfit,
      tax: acc.tax + row.tax,
    }),
    { sale: 0, cogs: 0, netProfit: 0, tax: 0 },
  );

  const margin =
    totals.sale > 0 ? ((totals.netProfit / totals.sale) * 100) : 0;

  const chartData = [...rows]
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .map((row) => ({
      label: formatDashboardDate(row.date),
      sales: row.sale,
      cogs: row.cogs,
    }));

  const handleDownload = () => {
    exportDailySalesCsv(rows, `daily-sales-${periodLabel.replace(/\s/g, "-")}.csv`);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="overflow-hidden rounded-sm border border-[#E5E7EB] bg-white shadow-sm">
        <div className="flex flex-col gap-2 border-b border-[#E5E7EB] px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-sm font-semibold text-[#111827]">
            Daily Sales - {periodLabel}
          </h3>
          <Button
            type="button"
            variant="outline"
            className="h-7 rounded-sm border-[#E5E7EB] bg-white px-3 text-xs font-semibold text-[#374151] hover:bg-[#F9FAFB]"
            onClick={handleDownload}
          >
            Download Report
          </Button>
        </div>
        <div className="overflow-x-auto">
          <Table className="min-w-[640px]">
            <TableHeader>
              <TableRow className="bg-[#FAFAFA] hover:bg-[#FAFAFA]">
                <TableHead className="w-10 px-3">
                  <input type="checkbox" className="size-3.5 rounded border-[#D1D5DB]" aria-label="Select all" />
                </TableHead>
                <TableHead className="text-xs font-semibold text-[#6B7280]">Date</TableHead>
                <TableHead className="text-right text-xs font-semibold text-[#6B7280]">Sale</TableHead>
                <TableHead className="text-right text-xs font-semibold text-[#6B7280]">COGS</TableHead>
                <TableHead className="text-right text-xs font-semibold text-[#6B7280]">Net Profit</TableHead>
                <TableHead className="text-right text-xs font-semibold text-[#6B7280]">Margin</TableHead>
                <TableHead className="text-right text-xs font-semibold text-[#6B7280]">Tax</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-sm text-[#9CA3AF]">
                    No Data Found!
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow key={row.id} className="hover:bg-[#F9FAFB]">
                    <TableCell className="px-3">
                      <input type="checkbox" className="size-3.5 rounded border-[#D1D5DB]" aria-label={`Select ${formatDashboardDate(row.date)}`} />
                    </TableCell>
                    <TableCell className="text-sm text-[#374151]">
                      {formatDashboardDate(row.date)}
                    </TableCell>
                    <TableCell className="text-right text-sm text-[#374151]">
                      {formatMoney(row.sale)}
                    </TableCell>
                    <TableCell className="text-right text-sm text-[#374151]">
                      {formatMoney(row.cogs)}
                    </TableCell>
                    <TableCell className="text-right text-sm text-[#374151]">
                      {formatMoney(row.netProfit)}
                    </TableCell>
                    <TableCell className="text-right text-sm text-[#374151]">
                      {formatPercent(row.margin)}
                    </TableCell>
                    <TableCell className="text-right text-sm text-[#374151]">
                      {formatMoney(row.tax)}
                    </TableCell>
                  </TableRow>
                ))
              )}
              {rows.length > 0 ? (
                <TableRow className="bg-[#FAFAFA] font-semibold hover:bg-[#FAFAFA]">
                  <TableCell />
                  <TableCell className="text-sm text-[#111827]">Total</TableCell>
                  <TableCell className="text-right text-sm text-[#111827]">
                    {formatMoney(totals.sale)}
                  </TableCell>
                  <TableCell className="text-right text-sm text-[#111827]">
                    {formatMoney(totals.cogs)}
                  </TableCell>
                  <TableCell className="text-right text-sm text-[#111827]">
                    {formatMoney(totals.netProfit)}
                  </TableCell>
                  <TableCell className="text-right text-sm text-[#111827]">
                    {formatPercent(margin)}
                  </TableCell>
                  <TableCell className="text-right text-sm text-[#111827]">
                    {formatMoney(totals.tax)}
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>
      </section>

      <section className="overflow-hidden rounded-sm border border-[#E5E7EB] bg-white shadow-sm">
        <div className="border-b border-[#E5E7EB] px-3 py-2.5">
          <h3 className="text-sm font-semibold text-[#111827]">Sales vs. COGS</h3>
        </div>
        <div className="p-4">
          <ChartContainer height={280}>
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <AreaChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "#6B7280" }}
                  axisLine={{ stroke: "#E5E7EB" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#6B7280" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `£${v}`}
                />
                <Tooltip
                  formatter={(value, name) => [formatMoney(Number(value ?? 0)), name === "sales" ? "Sales" : "COGS"]}
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid #E5E7EB",
                    background: "#fff",
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="var(--repair-primary)"
                  fill="var(--repair-primary)"
                  fillOpacity={0.12}
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="cogs"
                  stroke="#9CA3AF"
                  fill="#9CA3AF"
                  fillOpacity={0.08}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </section>
    </div>
  );
}

interface PaymentMethodsSectionProps {
  payments: PaymentMethodSummary[];
}

export function PaymentMethodsSection({ payments }: PaymentMethodsSectionProps) {
  const totalIn = payments.reduce((sum, p) => sum + p.paymentsIn, 0);
  const totalOut = payments.reduce((sum, p) => sum + p.paymentsOut, 0);

  const donutData = payments
    .filter((p) => p.amount > 0)
    .map((p, i) => ({
      label: p.method,
      value: p.amount,
      color: ["#D1D5DB", "#9CA3AF", "#6B7280", "#4B5563", "#E5E7EB"][i % 5],
    }));

  return (
    <CollapsibleCard title="Payment Methods" viewReportHref="/reports/payment-type-totals">
      <div className="grid gap-4 p-4 lg:grid-cols-2">
        <div className="space-y-4">
          {payments.map((payment) => (
            <div key={payment.method} className="space-y-1">
              <p className="text-sm font-semibold text-[#111827]">{payment.method}</p>
              <p className="text-lg font-bold text-[#111827]">{formatMoney(payment.amount)}</p>
              <div className="flex gap-4 text-xs text-[#6B7280]">
                <span>In: {formatMoney(payment.paymentsIn)}</span>
                <span>Out: {formatMoney(payment.paymentsOut)}</span>
              </div>
            </div>
          ))}
          <div className="space-y-1 border-t border-[#E5E7EB] pt-3 text-sm">
            <p className="font-medium text-[#374151]">
              Total Payments In: <span className="font-bold text-[#111827]">{formatMoney(totalIn)}</span>
            </p>
            <p className="font-medium text-[#374151]">
              Total Payments Out: <span className="font-bold text-[#111827]">{formatMoney(totalOut)}</span>
            </p>
          </div>
        </div>
        <div className="flex min-h-[220px] items-center justify-center">
          {donutData.length > 0 ? (
            <DonutChart data={donutData} height={220} innerRadius={50} outerRadius={78} />
          ) : (
            <p className="text-sm text-[#9CA3AF]">No payment data for selected period</p>
          )}
        </div>
      </div>
    </CollapsibleCard>
  );
}

export function StockAlertsSection() {
  return (
    <CollapsibleCard title="Stock Alerts">
      <div className="space-y-3 p-4">
        <div className="rounded-sm border border-[#FECACA] bg-[#FEF2F2] px-3 py-2 text-xs font-medium text-[#DC2626]">
          0 items need reordering—below minimum quantity.
        </div>
        <div className="overflow-x-auto">
          <Table className="min-w-[480px]">
            <TableHeader>
              <TableRow className="bg-[#FAFAFA] hover:bg-[#FAFAFA]">
                <TableHead className="text-xs font-semibold text-[#6B7280]">Item Name</TableHead>
                <TableHead className="text-xs font-semibold text-[#6B7280]">On Hand</TableHead>
                <TableHead className="text-xs font-semibold text-[#6B7280]">Stock Warning</TableHead>
                <TableHead className="text-xs font-semibold text-[#6B7280]">Reorder Level</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={4} className="py-8 text-center text-sm text-[#9CA3AF]">
                  No Data Found!
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </CollapsibleCard>
  );
}

interface RepairTicketsSectionProps {
  tickets: RepairTicketRow[];
}

function statusClass(status: string) {
  if (status === "IN PROGRESS") return "text-(--repair-primary)";
  if (status === "WAITING FOR INSPECTION") return "text-[#D97706]";
  return "text-[#374151]";
}

export function RepairTicketsSection({ tickets }: RepairTicketsSectionProps) {
  const router = useRouter();

  return (
    <CollapsibleCard title="Repair Tickets">
      <div className="relative p-4 pb-12">
        <div className="overflow-x-auto">
          <Table className="min-w-[900px]">
            <TableHeader>
              <TableRow className="bg-[#FAFAFA] hover:bg-[#FAFAFA]">
                <TableHead className="text-xs font-semibold text-[#6B7280]">ID</TableHead>
                <TableHead className="min-w-[200px] text-xs font-semibold text-[#6B7280]">Task</TableHead>
                <TableHead className="text-xs font-semibold text-[#6B7280]">Due At</TableHead>
                <TableHead className="text-xs font-semibold text-[#6B7280]">Assigned To</TableHead>
                <TableHead className="text-xs font-semibold text-[#6B7280]">Customer</TableHead>
                <TableHead className="text-xs font-semibold text-[#6B7280]">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-sm text-[#9CA3AF]">
                    No Data Found!
                  </TableCell>
                </TableRow>
              ) : (
                tickets.map((ticket) => (
                  <TableRow key={ticket.id} className="hover:bg-[#F9FAFB]">
                    <TableCell className="text-sm font-medium text-[#374151]">{ticket.id}</TableCell>
                    <TableCell className="text-sm text-[#374151]">{ticket.task}</TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-[#374151]">
                      {formatDashboardDateTime(ticket.dueAt)}
                    </TableCell>
                    <TableCell className="text-sm text-[#374151]">{ticket.assignedTo}</TableCell>
                    <TableCell className="text-sm text-[#374151]">{ticket.customer}</TableCell>
                    <TableCell className={cn("text-xs font-semibold", statusClass(ticket.status))}>
                      {ticket.status}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <Button
          type="button"
          className="absolute bottom-4 right-4 h-8 rounded-sm border-0 bg-(--repair-primary) px-4 text-xs font-semibold text-(--repair-on-primary) hover:opacity-90"
          onClick={() => router.push("/repairs/manage-tickets")}
        >
          View All
        </Button>
      </div>
    </CollapsibleCard>
  );
}
