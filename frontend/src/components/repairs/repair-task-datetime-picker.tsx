"use client";

import { useEffect, useRef, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import {
  formatTaskDueDateTime,
  getCalendarDays,
  isSameCalendarDay,
  MONTH_NAMES,
  WEEKDAY_LABELS,
} from "@/lib/repair-datetime";
import { cn } from "@/lib/utils";

interface RepairTaskDateTimePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  className?: string;
}

export function RepairTaskDateTimePicker({
  value,
  onChange,
  className,
}: RepairTaskDateTimePickerProps) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"date" | "time">("date");
  const [viewYear, setViewYear] = useState(value.getFullYear());
  const [viewMonth, setViewMonth] = useState(value.getMonth());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setViewYear(value.getFullYear());
      setViewMonth(value.getMonth());
      setMode("date");
    }
  }, [open, value]);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  const applyDatePart = (day: Date) => {
    const next = new Date(value);
    next.setFullYear(day.getFullYear(), day.getMonth(), day.getDate());
    onChange(next);
  };

  const applyTimePart = (hours: number, minutes: number) => {
    const next = new Date(value);
    next.setHours(hours, minutes, 0, 0);
    onChange(next);
  };

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const days = getCalendarDays(viewYear, viewMonth);
  const hours12 = value.getHours() % 12 || 12;
  const minutes = value.getMinutes();
  const period: "AM" | "PM" = value.getHours() >= 12 ? "PM" : "AM";

  const setTime12 = (hour12: number, min: number, p: "AM" | "PM") => {
    let h = hour12 % 12;
    if (p === "PM") h += 12;
    applyTimePart(h, min);
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex h-10 w-full items-center rounded-md border border-[#E5E7EB] bg-white pr-10 pl-3 text-left text-sm text-[#111827]",
          "hover:border-[var(--repair-primary)] focus:border-[var(--repair-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--repair-primary)]",
        )}
      >
        {formatTaskDueDateTime(value)}
      </button>
      <Calendar
        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-[#9CA3AF]"
        aria-hidden
      />

      {open ? (
        <div className="absolute top-full left-0 z-50 mt-1 w-[280px] rounded-lg border border-[#E5E7EB] bg-white p-3 shadow-lg">
          {mode === "date" ? (
            <>
              <div className="mb-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={prevMonth}
                  className="rounded p-1 text-[#6B7280] hover:bg-[#F3F4F6]"
                  aria-label="Previous month"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <span className="text-sm font-semibold text-[#111827]">
                  {MONTH_NAMES[viewMonth]} {viewYear}
                </span>
                <button
                  type="button"
                  onClick={nextMonth}
                  className="rounded p-1 text-[#6B7280] hover:bg-[#F3F4F6]"
                  aria-label="Next month"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>

              <div className="mb-1 grid grid-cols-7 gap-0.5 text-center">
                {WEEKDAY_LABELS.map((d) => (
                  <span key={d} className="py-1 text-[10px] font-medium text-[#9CA3AF]">
                    {d}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-0.5">
                {days.map((day, i) =>
                  day ? (
                    <button
                      key={day.toISOString()}
                      type="button"
                      onClick={() => {
                        applyDatePart(day);
                      }}
                      className={cn(
                        "mx-auto flex size-8 items-center justify-center rounded-full text-sm transition-colors",
                        isSameCalendarDay(day, value)
                          ? "bg-[var(--repair-primary)] font-semibold text-[var(--repair-on-primary)]"
                          : "text-[#374151] hover:bg-[#F3F4F6]",
                      )}
                    >
                      {day.getDate()}
                    </button>
                  ) : (
                    <span key={`empty-${i}`} className="size-8" />
                  ),
                )}
              </div>

              <div className="mt-2 flex justify-center border-t border-[#F3F4F6] pt-2">
                <button
                  type="button"
                  onClick={() => setMode("time")}
                  className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[var(--repair-primary)]"
                  aria-label="Set time"
                >
                  <Clock className="size-4" />
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="mb-3 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setMode("date")}
                  className="rounded p-1 text-[#6B7280] hover:bg-[#F3F4F6]"
                  aria-label="Back to calendar"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <span className="text-sm font-semibold text-[#111827]">Select time</span>
                <span className="size-4" />
              </div>

              <div className="flex items-center justify-center gap-2">
                <select
                  value={hours12}
                  onChange={(e) =>
                    setTime12(parseInt(e.target.value, 10), minutes, period)
                  }
                  className="h-9 rounded-md border border-[#E5E7EB] px-2 text-sm"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                    <option key={h} value={h}>
                      {String(h).padStart(2, "0")}
                    </option>
                  ))}
                </select>
                <span className="text-[#6B7280]">:</span>
                <select
                  value={minutes}
                  onChange={(e) =>
                    setTime12(hours12, parseInt(e.target.value, 10), period)
                  }
                  className="h-9 rounded-md border border-[#E5E7EB] px-2 text-sm"
                >
                  {Array.from({ length: 60 }, (_, i) => i).map((m) => (
                    <option key={m} value={m}>
                      {String(m).padStart(2, "0")}
                    </option>
                  ))}
                </select>
                <select
                  value={period}
                  onChange={(e) =>
                    setTime12(hours12, minutes, e.target.value as "AM" | "PM")
                  }
                  className="h-9 rounded-md border border-[#E5E7EB] px-2 text-sm"
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>

              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-1.5 text-xs font-medium text-[var(--repair-primary)] hover:bg-[color-mix(in_srgb,var(--repair-primary)_10%,white)]"
                >
                  Done
                </button>
              </div>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
