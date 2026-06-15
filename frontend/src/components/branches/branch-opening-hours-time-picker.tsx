"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

const HOURS = Array.from({ length: 24 }, (_, index) => index);
const MINUTES = [0, 15, 30, 45];

export const OPENING_HOURS_PRESETS = [
  { label: "9 – 5", opens: "09:00", closes: "17:00" },
  { label: "9 – 6", opens: "09:00", closes: "18:00" },
  { label: "10 – 4", opens: "10:00", closes: "16:00" },
  { label: "11 – 7", opens: "11:00", closes: "19:00" },
] as const;

export function parseTimeValue(time: string): { hour: number; minute: number } {
  const [hourPart, minutePart] = time.split(":");
  const hour = Number(hourPart);
  const minute = Number(minutePart);
  return {
    hour: Number.isFinite(hour) ? hour : 9,
    minute: MINUTES.includes(minute) ? minute : 0,
  };
}

export function formatTimeValue(hour: number, minute: number): string {
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function TimeScrollColumn({
  label,
  values,
  selected,
  onSelect,
  formatValue,
}: {
  label: string;
  values: number[];
  selected: number;
  onSelect: (value: number) => void;
  formatValue?: (value: number) => string;
}) {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const selectedEl = listRef.current?.querySelector('[data-selected="true"]');
    selectedEl?.scrollIntoView({ block: "center", behavior: "instant" });
  }, [selected]);

  return (
    <div className="min-w-0 flex-1">
      <p className="mb-1.5 text-center text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
        {label}
      </p>
      <div
        ref={listRef}
        className="scrollbar-hide h-24 overflow-y-auto rounded-lg border border-[#E5E7EB] bg-linear-to-b from-[#FAFAFA] to-white py-1"
      >
        {values.map((value) => {
          const active = value === selected;
          return (
            <button
              key={value}
              type="button"
              data-selected={active}
              onClick={() => onSelect(value)}
              className={cn(
                "mx-1 flex h-8 w-[calc(100%-0.5rem)] items-center justify-center rounded-md text-sm transition-all",
                active
                  ? "bg-(--repair-primary) font-semibold text-(--repair-on-primary) shadow-sm"
                  : "text-[#4B5563] hover:bg-white hover:text-[#111827]",
              )}
            >
              {formatValue ? formatValue(value) : String(value).padStart(2, "0")}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TimePickerRow({
  title,
  value,
  onChange,
}: {
  title: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const { hour, minute } = parseTimeValue(value);

  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-[#FAFAFA]/80 p-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#6B7280]">{title}</p>
      <div className="flex items-end gap-2">
        <TimeScrollColumn
          label="Hour"
          values={HOURS}
          selected={hour}
          onSelect={(nextHour) => onChange(formatTimeValue(nextHour, minute))}
        />
        <span className="pb-7 text-lg font-semibold text-[#D1D5DB]">:</span>
        <TimeScrollColumn
          label="Min"
          values={MINUTES}
          selected={minute}
          onSelect={(nextMinute) => onChange(formatTimeValue(hour, nextMinute))}
          formatValue={(v) => String(v).padStart(2, "0")}
        />
        <div className="flex min-w-[3.25rem] flex-col items-center pb-1">
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
            Set
          </p>
          <div className="flex h-24 items-center justify-center rounded-lg border border-dashed border-[#E5E7EB] bg-white px-2 text-center text-sm font-semibold text-(--repair-primary)">
            {formatTimeValue(hour, minute)}
          </div>
        </div>
      </div>
    </div>
  );
}

interface OpeningHoursTimePickerPanelProps {
  dayLabel: string;
  summary: string;
  isClosed: boolean;
  opensAt: string;
  closesAt: string;
  onClosedChange: (closed: boolean) => void;
  onOpensChange: (value: string) => void;
  onClosesChange: (value: string) => void;
  onApplyPreset: (opens: string, closes: string) => void;
  onCancel: () => void;
  onDone: () => void;
}

export function OpeningHoursTimePickerPanel({
  dayLabel,
  summary,
  isClosed,
  opensAt,
  closesAt,
  onClosedChange,
  onOpensChange,
  onClosesChange,
  onApplyPreset,
  onCancel,
  onDone,
}: OpeningHoursTimePickerPanelProps) {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-xl">
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-[#6B7280]">Opening hours</p>
          <p className="truncate text-sm font-semibold text-(--repair-primary)">{dayLabel}</p>
        </div>
        <p className="shrink-0 rounded-full border border-[color-mix(in_srgb,var(--repair-primary)_25%,white)] bg-[color-mix(in_srgb,var(--repair-primary)_8%,white)] px-3 py-1 text-xs font-semibold text-(--repair-primary)">
          {summary}
        </p>
      </div>

      <div className="scrollbar-hide min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
        <div className="grid grid-cols-2 gap-2 rounded-lg bg-[#F3F4F6] p-1">
          <button
            type="button"
            onClick={() => onClosedChange(false)}
            className={cn(
              "rounded-md px-3 py-2 text-sm font-medium transition-all",
              !isClosed
                ? "bg-white text-(--repair-primary) shadow-sm"
                : "text-[#6B7280] hover:text-[#374151]",
            )}
          >
            Open
          </button>
          <button
            type="button"
            onClick={() => onClosedChange(true)}
            className={cn(
              "rounded-md px-3 py-2 text-sm font-medium transition-all",
              isClosed
                ? "bg-white text-(--repair-primary) shadow-sm"
                : "text-[#6B7280] hover:text-[#374151]",
            )}
          >
            Closed
          </button>
        </div>

        {!isClosed ? (
          <>
            <div className="flex flex-wrap gap-2">
              {OPENING_HOURS_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => onApplyPreset(preset.opens, preset.closes)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                    opensAt === preset.opens && closesAt === preset.closes
                      ? "border-(--repair-primary) bg-[color-mix(in_srgb,var(--repair-primary)_10%,white)] text-(--repair-primary)"
                      : "border-[#E5E7EB] bg-white text-[#6B7280] hover:border-[#D1D5DB] hover:text-[#374151]",
                  )}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <TimePickerRow title="Opens" value={opensAt} onChange={onOpensChange} />
            <TimePickerRow title="Closes" value={closesAt} onChange={onClosesChange} />
          </>
        ) : (
          <div className="rounded-xl border border-dashed border-[#E5E7EB] bg-[#FAFAFA] px-4 py-8 text-center">
            <p className="text-sm font-medium text-[#374151]">Closed all day</p>
            <p className="mt-1 text-xs text-[#9CA3AF]">
              Customers will see this branch as closed on {dayLabel.toLowerCase()}.
            </p>
          </div>
        )}
      </div>

      <div className="flex shrink-0 justify-end gap-2 border-t border-[#E5E7EB] bg-[#F9FAFB] p-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-[#E5E7EB] bg-white px-3 py-1.5 text-sm font-medium text-[#374151] hover:bg-[#F9FAFB]"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onDone}
          className="min-w-20 rounded-md border-0 bg-(--repair-primary) px-3 py-1.5 text-sm font-semibold text-(--repair-on-primary) hover:opacity-90"
        >
          Done
        </button>
      </div>
    </div>
  );
}
