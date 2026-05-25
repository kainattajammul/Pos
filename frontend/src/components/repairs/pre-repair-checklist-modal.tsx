"use client";

import { useEffect, useMemo, useState } from "react";
import { CloudUpload, Info, X } from "lucide-react";
import {
  createEmptyChecklistState,
  PRE_REPAIR_CHECKLIST_CATEGORY_OPTIONS,
  PRE_REPAIR_CHECKLIST_COLUMNS,
  PRE_REPAIR_CHECKLIST_ITEM_IDS,
} from "@/lib/repairs-pre-repair-checklist-data";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const selectTriggerClass =
  "h-10 w-full rounded-md border border-[#E5E7EB] bg-white px-3 text-sm shadow-none focus-visible:border-[var(--repair-primary)] focus-visible:ring-1 focus-visible:ring-[var(--repair-primary)]";

interface PreRepairChecklistModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultCategory?: string;
  onSave?: (payload: {
    category: string;
    checked: Record<string, boolean>;
  }) => void;
}

export function PreRepairChecklistModal({
  open,
  onOpenChange,
  defaultCategory = "Mobile Repair",
  onSave,
}: PreRepairChecklistModalProps) {
  const [category, setCategory] = useState(defaultCategory);
  const [checked, setChecked] = useState<Record<string, boolean>>(
    createEmptyChecklistState,
  );

  useEffect(() => {
    if (open) {
      setCategory(defaultCategory);
    }
  }, [open, defaultCategory]);

  const allChecked = useMemo(
    () => PRE_REPAIR_CHECKLIST_ITEM_IDS.every((id) => checked[id]),
    [checked],
  );

  const handleSelectAll = (on: boolean) => {
    setChecked(
      Object.fromEntries(PRE_REPAIR_CHECKLIST_ITEM_IDS.map((id) => [id, on])),
    );
  };

  const handleToggle = (id: string, on: boolean) => {
    setChecked((prev) => ({ ...prev, [id]: on }));
  };

  const handleSave = () => {
    onSave?.({ category, checked });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-black/55 supports-backdrop-filter:backdrop-blur-[2px]"
        className="max-h-[90vh] w-[calc(100%-2rem)] max-w-4xl gap-0 overflow-hidden rounded-lg border border-[#E5E7EB] bg-white p-0 shadow-xl sm:max-w-4xl"
      >
        <div className="flex items-start justify-between border-b border-[#E5E7EB] px-5 py-4">
          <DialogTitle className="text-base font-semibold text-[#111827]">
            Pre Repair Condition Checklist
          </DialogTitle>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-md p-1 text-[#6B7280] transition-colors hover:bg-[#F3F4F6] hover:text-[#111827]"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-4">
          <div className="mb-4 max-w-md space-y-1.5">
            <Label className="inline-flex items-center gap-1.5 text-xs font-medium text-[#374151]">
              Category
              <Info
                className="size-3.5 text-[#9CA3AF]"
                aria-label="Category applies to this checklist template"
              />
            </Label>
            <Select value={category} onValueChange={(v) => setCategory(v ?? defaultCategory)}>
              <SelectTrigger className={selectTriggerClass}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRE_REPAIR_CHECKLIST_CATEGORY_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 [&_input[type=checkbox]]:hidden [&_input[type=radio]]:hidden">
            <div className="space-y-3">
              <ChecklistToggleRow
                label="Select All"
                checked={allChecked}
                onCheckedChange={handleSelectAll}
              />
              {PRE_REPAIR_CHECKLIST_COLUMNS[0].map((item) => (
                <ChecklistToggleRow
                  key={item.id}
                  label={item.label}
                  checked={Boolean(checked[item.id])}
                  onCheckedChange={(on) => handleToggle(item.id, on)}
                />
              ))}
            </div>

            <div className="space-y-3 sm:pt-9">
              {PRE_REPAIR_CHECKLIST_COLUMNS[1].map((item) => (
                <ChecklistToggleRow
                  key={item.id}
                  label={item.label}
                  checked={Boolean(checked[item.id])}
                  onCheckedChange={(on) => handleToggle(item.id, on)}
                />
              ))}
            </div>

            <div className="space-y-3 sm:pt-9">
              {PRE_REPAIR_CHECKLIST_COLUMNS[2].map((item) => (
                <ChecklistToggleRow
                  key={item.id}
                  label={item.label}
                  checked={Boolean(checked[item.id])}
                  onCheckedChange={(on) => handleToggle(item.id, on)}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-[#E5E7EB] bg-[#FAFAFA] px-5 py-4">
          <Button
            type="button"
            className="h-9 rounded-md border-0 px-4 text-sm font-semibold text-[var(--repair-on-primary)] shadow-sm hover:opacity-90"
            style={{ backgroundColor: "var(--repair-primary)" }}
          >
            + Device Condition
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            className="h-9 gap-1.5 rounded-md border-0 px-4 text-sm font-semibold text-[var(--repair-on-primary)] shadow-sm hover:opacity-90"
            style={{ backgroundColor: "var(--repair-primary)" }}
          >
            Save Checklist
            <CloudUpload className="size-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ChecklistToggleRow({
  label,
  checked,
  onCheckedChange,
}: {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="min-w-0 flex-1 text-sm text-[#374151]">{label}</span>
      <ChecklistSwitch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

/** Custom pill toggle — avoids Base UI Switch rendering extra native controls. */
function ChecklistSwitch({
  checked,
  onCheckedChange,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative inline-flex h-[18px] w-[32px] shrink-0 items-center rounded-full border border-transparent p-0.5 transition-colors outline-none",
        "focus-visible:ring-2 focus-visible:ring-[var(--repair-primary)]/40",
        checked ? "bg-[var(--repair-primary)]" : "bg-[#C8C4DC]",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "block size-3.5 rounded-full bg-white shadow-sm transition-transform",
          checked ? "translate-x-[14px]" : "translate-x-0",
        )}
      />
    </button>
  );
}
