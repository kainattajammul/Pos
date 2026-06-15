"use client";

import { Clock } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { OpeningHoursTimePickerPanel } from "@/components/branches/branch-opening-hours-time-picker";
import { parseDayHours } from "@/lib/branch-api-mapper";
import { branchInputClass } from "@/components/branches/branch-ui-primitives";
import { cn } from "@/lib/utils";

const VIEWPORT_MARGIN = 12;
const POPOVER_GAP = 8;
const POPOVER_WIDTH = 340;

function formatDisplay(value: string): string {
  const parsed = parseDayHours(value);
  if (parsed.is_closed) return "Closed";
  if (parsed.opens_at && parsed.closes_at) {
    return `${parsed.opens_at} – ${parsed.closes_at}`;
  }
  return value || "Set hours";
}

interface PopoverPosition {
  left: number;
  width: number;
  top: number;
  maxHeight: number;
}

interface BranchOpeningHoursDayFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export function BranchOpeningHoursDayField({
  label,
  value,
  onChange,
}: BranchOpeningHoursDayFieldProps) {
  const parsed = parseDayHours(value);
  const [open, setOpen] = useState(false);
  const [isClosed, setIsClosed] = useState(parsed.is_closed);
  const [opensAt, setOpensAt] = useState(parsed.opens_at ?? "09:00");
  const [closesAt, setClosesAt] = useState(parsed.closes_at ?? "18:00");
  const [position, setPosition] = useState<PopoverPosition | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const displayParsed = parseDayHours(value);
  const isClosedDisplay = displayParsed.is_closed;

  useEffect(() => {
    const next = parseDayHours(value);
    setIsClosed(next.is_closed);
    setOpensAt(next.opens_at ?? "09:00");
    setClosesAt(next.closes_at ?? "18:00");
  }, [value]);

  useEffect(() => {
    if (!open || !buttonRef.current) {
      setPosition(null);
      return;
    }

    const updatePosition = () => {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (!rect) return;

      const left = Math.min(
        Math.max(VIEWPORT_MARGIN, rect.left),
        window.innerWidth - POPOVER_WIDTH - VIEWPORT_MARGIN,
      );

      const maxPopoverHeight = window.innerHeight - VIEWPORT_MARGIN * 2;
      const spaceBelow = window.innerHeight - rect.bottom - POPOVER_GAP - VIEWPORT_MARGIN;
      const spaceAbove = rect.top - POPOVER_GAP - VIEWPORT_MARGIN;
      const openBelow = spaceBelow >= spaceAbove;

      let top: number;
      let maxHeight: number;

      if (openBelow) {
        top = rect.bottom + POPOVER_GAP;
        maxHeight = Math.min(maxPopoverHeight, spaceBelow);
      } else {
        maxHeight = Math.min(maxPopoverHeight, spaceAbove);
        top = Math.max(VIEWPORT_MARGIN, rect.top - POPOVER_GAP - maxHeight);
        maxHeight = Math.min(maxHeight, window.innerHeight - top - VIEWPORT_MARGIN);
      }

      setPosition({ left, width: POPOVER_WIDTH, top, maxHeight });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onDocClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (buttonRef.current?.contains(target) || popoverRef.current?.contains(target)) {
        return;
      }
      setOpen(false);
    };

    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  const apply = () => {
    if (isClosed) {
      onChange("Closed");
    } else {
      onChange(`${opensAt}-${closesAt}`);
    }
    setOpen(false);
  };

  const draftSummary = isClosed ? "Closed" : `${opensAt} – ${closesAt}`;

  const popover =
    open && position && typeof document !== "undefined"
      ? createPortal(
          <div
            ref={popoverRef}
            style={{
              position: "fixed",
              left: position.left,
              width: position.width,
              top: position.top,
              maxHeight: position.maxHeight,
              zIndex: 9999,
            }}
            className="flex min-h-0 flex-col"
          >
            <OpeningHoursTimePickerPanel
              dayLabel={label}
              summary={draftSummary}
              isClosed={isClosed}
              opensAt={opensAt}
              closesAt={closesAt}
              onClosedChange={setIsClosed}
              onOpensChange={setOpensAt}
              onClosesChange={setClosesAt}
              onApplyPreset={(opens, closes) => {
                setIsClosed(false);
                setOpensAt(opens);
                setClosesAt(closes);
              }}
              onCancel={() => setOpen(false)}
              onDone={apply}
            />
          </div>,
          document.body,
        )
      : null;

  return (
    <div className="space-y-1">
      <span className="text-sm font-medium text-[#374151]">{label}</span>
      <div className="relative">
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setOpen((current) => !current)}
          className={cn(
            branchInputClass,
            "flex items-center gap-2.5 pr-3 pl-3 text-left transition-shadow",
            open && "border-(--repair-primary) ring-2 ring-[color-mix(in_srgb,var(--repair-primary)_20%,white)]",
            !open && "hover:border-[#D1D5DB]",
          )}
        >
          <span
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-lg",
              isClosedDisplay
                ? "bg-[#F3F4F6] text-[#9CA3AF]"
                : "bg-[color-mix(in_srgb,var(--repair-primary)_12%,white)] text-(--repair-primary)",
            )}
          >
            <Clock className="size-4" />
          </span>
          <span
            className={cn(
              "min-w-0 flex-1 truncate text-sm",
              isClosedDisplay ? "text-[#9CA3AF]" : "font-medium text-[#111827]",
            )}
          >
            {formatDisplay(value)}
          </span>
        </button>
      </div>
      {popover}
    </div>
  );
}
