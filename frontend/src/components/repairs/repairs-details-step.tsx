"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Flag, ListChecks, MoreHorizontal, ImageIcon } from "lucide-react";
import { RepairLockInput } from "@/components/repairs/repair-lock-input";
import { RepairTaskDateTimePicker } from "@/components/repairs/repair-task-datetime-picker";
import { PreRepairChecklistModal } from "@/components/repairs/pre-repair-checklist-modal";
import { RepairsConditionImagesPanel } from "@/components/repairs/repairs-condition-images-panel";
import { toast } from "sonner";
import {
  revokeConditionImages,
  type RepairConditionImage,
} from "@/lib/repairs-condition-images";
import {
  ASSIGNED_TO_OPTIONS,
  DEVICE_LOCATION_OPTIONS,
  DEVICE_NETWORK_OPTIONS,
  IMEI_SERIAL_OPTIONS,
  REPAIR_DETAILS_DEFAULTS,
  REPAIR_TASK_STATUS_OPTIONS,
  REPAIR_TASK_TYPE_OPTIONS,
  WARRANTY_UNIT_OPTIONS,
  type ImeiSerialType,
  type RepairDetailsFormValues,
  type RepairDetailsSubTab,
} from "@/lib/repairs-details-data";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const fieldInputClass =
  "h-10 w-full rounded-md border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:border-[var(--repair-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--repair-primary)]";

const selectTriggerClass =
  "h-10 w-full rounded-md border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] shadow-none focus-visible:border-[var(--repair-primary)] focus-visible:ring-1 focus-visible:ring-[var(--repair-primary)]";

interface RepairsDetailsStepProps {
  selectedCategoryLabel?: string | null;
  selectedDeviceId?: string | null;
  initialRepairCharges?: string;
  onConfirm?: (values: RepairDetailsFormValues) => void;
  onFormChange?: (values: RepairDetailsFormValues) => void;
}

export function RepairsDetailsStep({
  selectedCategoryLabel,
  selectedDeviceId,
  initialRepairCharges,
  onConfirm,
  onFormChange,
}: RepairsDetailsStepProps) {
  const [subTab, setSubTab] = useState<RepairDetailsSubTab>("checklist");
  const [checklistModalOpen, setChecklistModalOpen] = useState(false);
  const [conditionImages, setConditionImages] = useState<RepairConditionImage[]>([]);
  const conditionImagesRef = useRef(conditionImages);
  conditionImagesRef.current = conditionImages;
  const checklistCategory = selectedCategoryLabel ?? "Mobile Repair";
  const [form, setForm] = useState<RepairDetailsFormValues>({
    ...REPAIR_DETAILS_DEFAULTS,
    repairCharges: initialRepairCharges ?? REPAIR_DETAILS_DEFAULTS.repairCharges,
  });

  useEffect(() => {
    if (initialRepairCharges !== undefined) {
      setForm((prev) => ({ ...prev, repairCharges: initialRepairCharges }));
    }
  }, [initialRepairCharges]);

  useEffect(() => {
    onFormChange?.(form);
  }, [form, onFormChange]);

  useEffect(() => {
    return () => {
      revokeConditionImages(conditionImagesRef.current);
    };
  }, []);

  useEffect(() => {
    setConditionImages((prev) => {
      revokeConditionImages(prev);
      return [];
    });
  }, [selectedDeviceId]);

  const update = <K extends keyof RepairDetailsFormValues>(
    key: K,
    value: RepairDetailsFormValues[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleConfirm = () => {
    onConfirm?.(form);
  };

  return (
    <>
    <PreRepairChecklistModal
      open={checklistModalOpen}
      onOpenChange={setChecklistModalOpen}
      defaultCategory={checklistCategory}
      onSave={() => {
        toast.success("Pre-repair checklist saved");
      }}
    />
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-4 flex shrink-0 flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <DetailsSubTabButton
            active={subTab === "checklist"}
            onClick={() => {
              setSubTab("checklist");
              setChecklistModalOpen(true);
            }}
          >
            <ListChecks className="size-4 shrink-0" aria-hidden />
            Pre-Repair Checklist
          </DetailsSubTabButton>
          <DetailsSubTabButton
            active={subTab === "condition-images"}
            onClick={() => {
              setSubTab("condition-images");
              setChecklistModalOpen(false);
            }}
          >
            <ImageIcon className="size-4 shrink-0" aria-hidden />
            Pre-Repair Condition Images
          </DetailsSubTabButton>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="size-10 shrink-0 border-[#E5E7EB] bg-white text-[#6B7280] hover:bg-pos-page"
                  aria-label="More options"
                />
              }
            >
              <MoreHorizontal className="size-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Print repair label</DropdownMenuItem>
              <DropdownMenuItem>Duplicate ticket</DropdownMenuItem>
              <DropdownMenuItem>Reset form</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            type="button"
            onClick={handleConfirm}
            className="h-10 shrink-0 rounded-md border-0 px-6 text-sm font-semibold text-[var(--repair-on-primary)] shadow-sm hover:opacity-90"
            style={{ backgroundColor: "var(--repair-primary)" }}
          >
            Confirm
          </Button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
        {subTab === "checklist" ? (
          <form
            className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              handleConfirm();
            }}
          >
            <div className="space-y-4">
              <DetailField label="IMEI / Serial">
                <div className="flex gap-2">
                  <Select
                    value={form.imeiSerialType}
                    onValueChange={(v) =>
                      update("imeiSerialType", (v ?? "IMEI") as ImeiSerialType)
                    }
                  >
                    <SelectTrigger className={cn(selectTriggerClass, "w-[108px] shrink-0")}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {IMEI_SERIAL_OPTIONS.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    value={form.imeiSerialValue}
                    onChange={(e) => update("imeiSerialValue", e.target.value)}
                    placeholder={`Enter ${form.imeiSerialType}`}
                    className={fieldInputClass}
                  />
                </div>
              </DetailField>

              <DetailField label="Passcode / Pattern Lock">
                <div className="mb-2 flex rounded-md border border-[#E5E7EB] p-0.5">
                  <SegmentButton
                    active={form.lockType === "passcode"}
                    onClick={() => update("lockType", "passcode")}
                  >
                    Passcode
                  </SegmentButton>
                  <SegmentButton
                    active={form.lockType === "pattern"}
                    onClick={() => update("lockType", "pattern")}
                  >
                    Pattern Lock
                  </SegmentButton>
                </div>
                <RepairLockInput
                  lockType={form.lockType}
                  passcode={form.passcode}
                  patternLock={form.patternLock}
                  onPasscodeChange={(v) => update("passcode", v)}
                  onPatternChange={(v) => update("patternLock", v)}
                  inputClassName={fieldInputClass}
                />
              </DetailField>

              <DetailField label="Warranty Applicable">
                <div className="flex gap-2">
                  <Input
                    value={form.warrantyValue}
                    onChange={(e) => update("warrantyValue", e.target.value)}
                    className={cn(fieldInputClass, "flex-1")}
                    inputMode="numeric"
                  />
                  <Select
                    value={form.warrantyUnit}
                    onValueChange={(v) => update("warrantyUnit", v ?? "Days")}
                  >
                    <SelectTrigger className={cn(selectTriggerClass, "w-[100px] shrink-0")}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {WARRANTY_UNIT_OPTIONS.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </DetailField>

              <DetailField label="Assigned to">
                <Select
                  value={form.assignedTo}
                  onValueChange={(v) => update("assignedTo", v ?? REPAIR_DETAILS_DEFAULTS.assignedTo)}
                >
                  <SelectTrigger className={selectTriggerClass}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ASSIGNED_TO_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </DetailField>

              <DetailField label="Task Due Date & Time">
                <RepairTaskDateTimePicker
                  value={form.taskDueAt}
                  onChange={(date) => update("taskDueAt", date)}
                />
              </DetailField>

              <DetailField
                label={
                  <span className="inline-flex items-center gap-1.5">
                    Diagnostic Note
                    <Flag
                      className="size-3.5 fill-red-500 text-red-500"
                      aria-label="Important"
                    />
                  </span>
                }
              >
                <textarea
                  value={form.diagnosticNote}
                  onChange={(e) => update("diagnosticNote", e.target.value)}
                  rows={4}
                  placeholder="Enter diagnostic notes..."
                  className={cn(
                    fieldInputClass,
                    "min-h-[96px] resize-y bg-[#FFFBEB] py-2",
                  )}
                />
              </DetailField>
            </div>

            <div className="space-y-4">
              <DetailField label="Repair Charges">
                <Input
                  value={form.repairCharges}
                  onChange={(e) => update("repairCharges", e.target.value)}
                  className={fieldInputClass}
                  inputMode="decimal"
                />
              </DetailField>

              <DetailField label="Repair Task Status">
                <Select
                  value={form.repairTaskStatus}
                  onValueChange={(v) =>
                    update("repairTaskStatus", v ?? REPAIR_DETAILS_DEFAULTS.repairTaskStatus)
                  }
                >
                  <SelectTrigger className={selectTriggerClass}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {REPAIR_TASK_STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </DetailField>

              <DetailField label="Device Physical Location">
                <Select
                  value={form.devicePhysicalLocation}
                  onValueChange={(v) => update("devicePhysicalLocation", v ?? "")}
                >
                  <SelectTrigger className={selectTriggerClass}>
                    <SelectValue placeholder="Select Physical Location" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEVICE_LOCATION_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </DetailField>

              <DetailField label="Repair Task Type">
                <Select
                  value={form.repairTaskType}
                  onValueChange={(v) =>
                    update("repairTaskType", v ?? REPAIR_DETAILS_DEFAULTS.repairTaskType)
                  }
                >
                  <SelectTrigger className={selectTriggerClass}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {REPAIR_TASK_TYPE_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </DetailField>

              <DetailField label="Device Network">
                <Select
                  value={form.deviceNetwork}
                  onValueChange={(v) => update("deviceNetwork", v ?? "")}
                >
                  <SelectTrigger className={selectTriggerClass}>
                    <SelectValue placeholder="Select Network" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEVICE_NETWORK_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </DetailField>

              <DetailField label="Additional Note">
                <textarea
                  value={form.additionalNote}
                  onChange={(e) => update("additionalNote", e.target.value)}
                  rows={4}
                  placeholder="Additional notes..."
                  className={cn(fieldInputClass, "min-h-[96px] resize-y py-2")}
                />
              </DetailField>
            </div>
          </form>
        ) : (
          <RepairsConditionImagesPanel
            images={conditionImages}
            onImagesChange={setConditionImages}
          />
        )}
      </div>
    </div>
    </>
  );
}

function DetailsSubTabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-xs font-medium transition-colors sm:text-sm",
        active
          ? "border-[var(--repair-primary)] bg-[color-mix(in_srgb,var(--repair-primary)_12%,white)] text-[var(--repair-primary)]"
          : "border-[#E5E7EB] bg-white text-[#6B7280] hover:border-[#D1D5DB] hover:text-[#374151]",
      )}
    >
      {children}
    </button>
  );
}

function SegmentButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex-1 rounded px-3 py-1.5 text-xs font-medium transition-colors sm:text-sm",
        active
          ? "bg-[var(--repair-primary)] text-[var(--repair-on-primary)] shadow-sm"
          : "text-[#6B7280] hover:text-[#374151]",
      )}
    >
      {children}
    </button>
  );
}

function DetailField({
  label,
  children,
}: {
  label: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-[#374151]">{label}</Label>
      {children}
    </div>
  );
}
