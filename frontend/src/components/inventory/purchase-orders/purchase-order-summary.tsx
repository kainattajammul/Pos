"use client";

function MiniBarChart({ color }: { color: "green" | "red" }) {
  const bars =
    color === "green"
      ? ["h-3", "h-4", "h-2", "h-5", "h-3"]
      : ["h-2", "h-4", "h-3", "h-5", "h-2"];
  const barColor = color === "green" ? "bg-[#22C55E]" : "bg-[#EF4444]";

  return (
    <div className="flex items-end gap-0.5" aria-hidden>
      {bars.map((h, i) => (
        <span key={i} className={`w-1 rounded-sm ${barColor} ${h}`} />
      ))}
    </div>
  );
}

interface PurchaseOrderSummaryProps {
  totalValue: number;
  amountPayable: number;
}

function money(amount: number) {
  return `£${amount.toFixed(2)}`;
}

export function PurchaseOrderSummary({
  totalValue,
  amountPayable,
}: PurchaseOrderSummaryProps) {
  return (
    <div className="flex flex-wrap items-center gap-6 md:gap-10">
      <div className="flex items-center gap-3">
        <MiniBarChart color="green" />
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#6B7280]">
            Total Value
          </p>
          <p className="text-lg font-bold text-[#22C55E]">{money(totalValue)}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <MiniBarChart color="red" />
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#6B7280]">
            Amount Payable
          </p>
          <p className="text-lg font-bold text-[#EF4444]">{money(amountPayable)}</p>
        </div>
      </div>
    </div>
  );
}
