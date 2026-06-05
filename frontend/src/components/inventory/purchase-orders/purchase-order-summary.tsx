"use client";

import { BarChart3, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/format";

interface PurchaseOrderSummaryProps {
  totalValue: number;
  amountPayable: number;
}

/** Fixed palette — not tied to app theme swatch or dark mode */
const PALETTE = {
  green: {
    value: "#15803D",
    border: "#BBF7D0",
    borderHover: "#86EFAC",
    stripe: "linear-gradient(180deg, #22C55E 0%, #16A34A 100%)",
    iconBg: "linear-gradient(135deg, #DCFCE7 0%, #BBF7D0 100%)",
    icon: "#16A34A",
    bar: "linear-gradient(180deg, #22C55E 0%, #16A34A 100%)",
    glow: "#22C55E",
  },
  red: {
    value: "#B91C1C",
    border: "#FECACA",
    borderHover: "#FCA5A5",
    stripe: "linear-gradient(180deg, #EF4444 0%, #DC2626 100%)",
    iconBg: "linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)",
    icon: "#DC2626",
    bar: "linear-gradient(180deg, #EF4444 0%, #DC2626 100%)",
    glow: "#EF4444",
  },
} as const;

function SparkBars({ variant }: { variant: "green" | "red" }) {
  const heights = variant === "green" ? [40, 65, 35, 80, 55, 70] : [30, 55, 45, 75, 40, 60];
  const palette = PALETTE[variant];

  return (
    <div className="flex h-10 items-end gap-1 opacity-90" aria-hidden>
      {heights.map((h, i) => (
        <span
          key={i}
          className="w-1.5 rounded-full"
          style={{
            height: `${h}%`,
            background: palette.bar,
          }}
        />
      ))}
    </div>
  );
}

function SummaryStatCard({
  label,
  value,
  variant,
  icon: Icon,
}: {
  label: string;
  value: string;
  variant: "green" | "red";
  icon: typeof BarChart3;
}) {
  const palette = PALETTE[variant];

  return (
    <article
      className={cn(
        "purchase-order-stat-card group relative min-w-[168px] overflow-hidden rounded-lg border px-4 py-3 shadow-sm transition-all duration-200",
        "hover:-translate-y-0.5 hover:shadow-md",
        "bg-white dark:bg-white",
      )}
      style={{
        colorScheme: "light",
        backgroundColor: "#ffffff",
        borderColor: palette.border,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = palette.borderHover;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = palette.border;
      }}
    >
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-1"
        style={{ background: palette.stripe }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-6 -top-6 size-24 rounded-full opacity-[0.07]"
        style={{ backgroundColor: palette.glow }}
        aria-hidden
      />

      <div className="relative flex items-start justify-between gap-3 pl-2">
        <div className="min-w-0 flex-1">
          <p
            className="text-[11px] font-semibold uppercase tracking-wider"
            style={{ color: "#6B7280" }}
          >
            {label}
          </p>
          <p
            className="mt-1 text-2xl font-bold tabular-nums tracking-tight dark:!text-[inherit]"
            style={{ color: palette.value }}
          >
            {value}
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div
            className="flex size-10 shrink-0 items-center justify-center rounded-lg shadow-sm"
            style={{
              background: palette.iconBg,
              color: palette.icon,
            }}
          >
            <Icon className="size-5" strokeWidth={2.25} />
          </div>
          <SparkBars variant={variant} />
        </div>
      </div>
    </article>
  );
}

export function PurchaseOrderSummary({
  totalValue,
  amountPayable,
}: PurchaseOrderSummaryProps) {
  return (
    <div
      className="flex flex-wrap items-stretch gap-3"
      style={{ colorScheme: "light" }}
      data-theme-lock="purchase-order-summary"
    >
      <SummaryStatCard
        label="Total Value"
        value={formatCurrency(totalValue)}
        variant="green"
        icon={BarChart3}
      />
      <SummaryStatCard
        label="Amount Payable"
        value={formatCurrency(amountPayable)}
        variant="red"
        icon={Wallet}
      />
    </div>
  );
}
