"use client";

import {
  ChevronRight,
  FileText,
  MoreHorizontal,
  Plus,
  Receipt,
  Shield,
  Ticket,
  Trash2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { RepairCategoryCard, RepairStep } from "@/lib/repairs-pos-data";
import { REPAIR_CATEGORIES, REPAIR_STEPS } from "@/lib/repairs-pos-data";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RepairsCategoryPanelProps {
  activeStep: RepairStep;
  onStepChange: (step: RepairStep) => void;
}

export function RepairsCategoryPanel({
  activeStep,
  onStepChange,
}: RepairsCategoryPanelProps) {
  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col bg-white">
      {/* Breadcrumb steps */}
      <div className="shrink-0 border-b border-[#E5E7EB] px-4 py-3">
        <nav className="flex flex-wrap items-center gap-1 text-sm">
          {REPAIR_STEPS.map((step, index) => (
            <span key={step} className="flex items-center gap-1">
              {index > 0 ? (
                <ChevronRight className="size-4 text-[#9CA3AF]" aria-hidden />
              ) : null}
              <button
                type="button"
                onClick={() => onStepChange(step)}
                className={cn(
                  "rounded px-1.5 py-0.5 font-medium transition-colors",
                  activeStep === step
                    ? "text-[var(--repair-primary)]"
                    : "text-[#6B7280] hover:text-[#111827]",
                )}
              >
                {step}
              </button>
            </span>
          ))}
        </nav>
      </div>

      {/* Category grid */}
      <div className="min-h-0 flex-1 overflow-y-auto p-4 md:p-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {REPAIR_CATEGORIES.map((card) => (
            <CategoryCard key={card.id} card={card} />
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="shrink-0 space-y-2 border-t border-[#E5E7EB] bg-[#F9FAFB] p-3 md:p-4">
        <div className="flex flex-wrap gap-2">
          <ActionButton icon={Ticket} label="View Tickets" />
          <ActionButton icon={Receipt} label="View Invoices" />
          <ActionButton icon={FileText} label="Create Estimate" />
          <ActionButton
            icon={Plus}
            label="Create Ticket"
            variant="primary"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <ActionButton icon={Shield} label="Warranty Claim" />
          <ActionButton icon={MoreHorizontal} label="More Actions" />
          <ActionButton icon={Trash2} label="Cancel" variant="danger" />
          <ActionButton label="Checkout" variant="checkout" />
        </div>
      </div>
    </section>
  );
}

function CategoryCard({ card }: { card: RepairCategoryCard }) {
  const Icon = card.icon;

  if (card.isAdd) {
    return (
      <button
        type="button"
        className="flex min-h-[120px] flex-col items-center justify-center gap-2 rounded-xl p-4 text-[var(--repair-on-primary)] shadow-md transition-transform hover:scale-[1.02] hover:shadow-lg"
        style={{
          background: `linear-gradient(135deg, var(--repair-primary) 0%, var(--repair-accent-end) 100%)`,
        }}
      >
        <div className="flex size-12 items-center justify-center rounded-full bg-white/20">
          <Plus className="size-8" strokeWidth={2.5} />
        </div>
        <span className="text-sm font-semibold">{card.label}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      className="flex min-h-[120px] flex-col items-center justify-center gap-3 rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-sm transition-all hover:border-[var(--repair-accent)] hover:bg-[var(--repair-primary-light)]/40 hover:shadow-md"
    >
      <Icon className="size-10 stroke-[1.25] text-[#374151]" />
      <span className="text-center text-sm font-medium text-[#111827]">{card.label}</span>
    </button>
  );
}

function ActionButton({
  label,
  icon: Icon,
  variant = "neutral",
}: {
  label: string;
  icon?: LucideIcon;
  variant?: "neutral" | "primary" | "danger" | "checkout";
}) {
  return (
    <Button
      type="button"
      variant="outline"
      className={cn(
        "h-9 gap-1.5 text-xs font-medium md:text-sm",
        variant === "neutral" &&
          "border-[#E5E7EB] bg-[#F3F4F6] text-[#374151] hover:bg-[#E5E7EB]",
        variant === "primary" &&
          "border-[var(--repair-primary)] bg-[var(--repair-primary)] text-[var(--repair-on-primary)] hover:opacity-90",
        variant === "danger" &&
          "border-red-200 bg-red-50 text-red-600 hover:bg-red-100",
        variant === "checkout" &&
          "border-[var(--repair-accent-end)] bg-gradient-to-r from-[var(--repair-primary)] to-[var(--repair-accent)] text-[var(--repair-on-primary)] hover:opacity-90",
      )}
    >
      {Icon ? <Icon className="size-4" /> : null}
      {label}
    </Button>
  );
}
