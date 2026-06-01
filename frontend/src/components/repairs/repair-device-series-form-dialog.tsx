"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { RepairDeviceSeries } from "@/lib/repairs-series-data";
import type { RepairManufacturer } from "@/lib/repairs-pos-data";

const fieldClass =
  "h-10 w-full rounded-md border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:border-[var(--repair-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--repair-primary)]";

export interface RepairDeviceSeriesFormValues {
  name: string;
}

interface RepairDeviceSeriesFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  manufacturerName?: string;
  isSubmitting?: boolean;
  series?: RepairDeviceSeries | null;
  onSave: (values: RepairDeviceSeriesFormValues) => void;
}

export function RepairDeviceSeriesFormDialog({
  open,
  onOpenChange,
  manufacturerName,
  isSubmitting = false,
  series = null,
  onSave,
}: RepairDeviceSeriesFormDialogProps) {
  const isEdit = Boolean(series?.dbId);
  const [name, setName] = useState("");

  useEffect(() => {
    if (!open) return;
    setName(series?.name ?? "");
  }, [open, series]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length < 2) return;
    onSave({ name: trimmed });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-0 p-0">
        <div className="border-b border-[#E5E7EB] px-6 py-4">
          <DialogTitle className="text-base font-semibold text-[#111827]">
            {isEdit ? "Edit Series" : "Create Series"}
          </DialogTitle>
          {manufacturerName ? (
            <p className="mt-1 text-sm text-[#6B7280]">
              Under {manufacturerName}
            </p>
          ) : null}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          <div className="space-y-2">
            <Label htmlFor="series-name" className="text-sm text-[#374151]">
              Series name
            </Label>
            <Input
              id="series-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Z Series, 17 Series"
              className={fieldClass}
              minLength={2}
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || name.trim().length < 2}>
              {isSubmitting ? "Saving…" : isEdit ? "Save" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
