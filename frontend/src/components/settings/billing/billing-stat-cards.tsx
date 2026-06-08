"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export interface BillingStatCardItem {
  title: string;
  value: string;
  actionLabel?: string;
  onAction?: () => void;
}

interface BillingStatCardsProps {
  items: BillingStatCardItem[];
}

export function BillingStatCards({ items }: BillingStatCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {items.map((item) => (
        <article
          key={item.title}
          className="flex flex-col items-center rounded-sm border border-[#E5E7EB] bg-white px-4 py-6 text-center shadow-sm"
        >
          <h3 className="text-sm font-medium text-[#6B7280]">{item.title}</h3>
          <p className="mt-3 text-3xl font-bold tracking-tight text-[#111827]">
            {item.value}
          </p>
          {item.actionLabel ? (
            <Button
              type="button"
              size="sm"
              className="mt-4 h-8 rounded-sm bg-(--repair-primary) px-4 text-xs font-semibold text-white hover:opacity-90"
              onClick={
                item.onAction ??
                (() => toast.message(`${item.actionLabel} — connect billing API when ready`))
              }
            >
              {item.actionLabel}
            </Button>
          ) : null}
        </article>
      ))}
    </div>
  );
}
