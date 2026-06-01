"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { RepairDevice } from "@/lib/repairs-devices-data";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface RepairsAssignDevicesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  seriesName: string;
  devices: RepairDevice[];
  assignedDeviceDbIds: number[];
  isSubmitting?: boolean;
  onAssign: (deviceDbIds: number[]) => void;
}

export function RepairsAssignDevicesDialog({
  open,
  onOpenChange,
  seriesName,
  devices,
  assignedDeviceDbIds,
  isSubmitting = false,
  onAssign,
}: RepairsAssignDevicesDialogProps) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<number[]>([]);

  const available = useMemo(() => {
    const assigned = new Set(assignedDeviceDbIds);
    return devices.filter(
      (d) => !d.isAdd && d.dbId != null && !assigned.has(d.dbId),
    );
  }, [devices, assignedDeviceDbIds]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return available;
    return available.filter((d) => d.name.toLowerCase().includes(q));
  }, [available, query]);

  const toggle = (dbId: number) => {
    setSelected((prev) =>
      prev.includes(dbId) ? prev.filter((id) => id !== dbId) : [...prev, dbId],
    );
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setQuery("");
      setSelected([]);
    }
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[85vh] max-w-lg flex-col gap-0 p-0">
        <div className="border-b border-[#E5E7EB] px-6 py-4">
          <DialogTitle className="text-base font-semibold text-[#111827]">
            Add models to {seriesName}
          </DialogTitle>
          <p className="mt-1 text-sm text-[#6B7280]">
            Select existing models to assign to this series.
          </p>
        </div>

        <div className="relative border-b border-[#E5E7EB] px-6 py-3">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search models"
            className="h-10 w-full rounded-md border border-[#E5E7EB] bg-white pr-10 pl-3 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:border-[var(--repair-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--repair-primary)]"
          />
          <Search
            className="pointer-events-none absolute top-1/2 right-9 size-4 -translate-y-1/2 text-[#9CA3AF]"
            aria-hidden
          />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-3">
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-[#6B7280]">
              No unassigned models available.
            </p>
          ) : (
            <ul className="space-y-1">
              {filtered.map((device) => {
                const dbId = device.dbId!;
                const checked = selected.includes(dbId);
                return (
                  <li key={dbId}>
                    <label
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2.5 text-sm transition-colors",
                        checked
                          ? "border-[var(--repair-primary)] bg-[var(--repair-primary)]/5"
                          : "border-[#E5E7EB] hover:border-[#D1D5DB]",
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggle(dbId)}
                        className="size-4 accent-[var(--repair-primary)]"
                      />
                      <span className="font-medium text-[#111827]">{device.name}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-[#E5E7EB] px-6 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={isSubmitting || selected.length === 0}
            onClick={() => onAssign(selected)}
          >
            {isSubmitting ? "Assigning…" : `Assign (${selected.length})`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
