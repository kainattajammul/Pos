"use client";

import { ChevronDown, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface TicketViewCollapsibleProps {
  title: string;
  icon?: LucideIcon;
  open: boolean;
  onToggle: () => void;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function TicketViewCollapsible({
  title,
  icon: Icon,
  open,
  onToggle,
  headerAction,
  children,
  className,
}: TicketViewCollapsibleProps) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-md border border-[#E5E7EB] bg-white shadow-sm",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b border-[#E5E7EB] bg-[#FAFBFC] px-3 py-2.5">
        <button
          type="button"
          onClick={onToggle}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
        >
          {Icon ? (
            <Icon className="size-4 shrink-0 text-(--repair-primary)" aria-hidden />
          ) : null}
          <span className="truncate text-sm font-semibold text-[#374151]">{title}</span>
          <ChevronDown
            className={cn(
              "ml-auto size-4 shrink-0 text-[#9CA3AF] transition-transform",
              open && "rotate-180",
            )}
            aria-hidden
          />
        </button>
        {headerAction ? (
          <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
            {headerAction}
          </div>
        ) : null}
      </div>
      {open ? <div className="p-3">{children}</div> : null}
    </section>
  );
}
