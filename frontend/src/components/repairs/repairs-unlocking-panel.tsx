"use client";

import { useState } from "react";
import { AlertCircle, Unlock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
import {
  UNLOCKING_FORM_DEFAULTS,
  UNLOCKING_TYPES,
  type UnlockingRequestFormValues,
  type UnlockingType,
} from "@/lib/repairs-unlocking-data";

const fieldInputClass =
  "h-10 w-full rounded-md border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:border-[var(--repair-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--repair-primary)]";

const selectTriggerClass =
  "h-10 w-full rounded-md border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] shadow-none focus-visible:border-[var(--repair-primary)] focus-visible:ring-1 focus-visible:ring-[var(--repair-primary)]";

export function RepairsUnlockingPanel() {
  const [form, setForm] = useState<UnlockingRequestFormValues>({
    ...UNLOCKING_FORM_DEFAULTS,
  });

  const update = <K extends keyof UnlockingRequestFormValues>(
    key: K,
    value: UnlockingRequestFormValues[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.deviceBrand.trim()) {
      toast.error("Please enter the device brand");
      return;
    }
    if (!form.deviceModel.trim()) {
      toast.error("Please enter the device model");
      return;
    }
    if (!form.imei.trim()) {
      toast.error("Please enter the IMEI number");
      return;
    }
    if (!form.unlockingType) {
      toast.error("Please select an unlocking type");
      return;
    }

    toast.success("Unlocking request submitted", {
      description: `${form.deviceBrand} ${form.deviceModel} · ${form.unlockingType}. Our team will confirm pricing.`,
    });
  };

  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col bg-white">
      <div className="min-h-0 flex-1 overflow-y-auto p-4 md:p-5">
        <div className="mx-auto w-full max-w-3xl">
          <div className="mb-6 flex items-start gap-3">
            <div
              className="flex size-11 shrink-0 items-center justify-center rounded-lg"
              style={{
                background: `linear-gradient(135deg, var(--repair-primary) 0%, var(--repair-accent-end) 100%)`,
              }}
            >
              <Unlock className="size-5 text-[var(--repair-on-primary)]" aria-hidden />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#111827]">Device unlocking</h2>
              <p className="mt-1 text-sm leading-relaxed text-[#6B7280]">
                Unlock your phone from network restrictions or account locks. Submit your
                device details and our team will confirm availability and pricing.
              </p>
            </div>
          </div>

          <div
            className="mb-6 flex gap-2.5 rounded-lg border border-[#FDE68A] bg-[#FFFBEB] px-3.5 py-3 text-sm text-[#92400E]"
            role="note"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
            <p>
              Unlocking availability depends on device model, network, and lock status.
            </p>
          </div>

          <form
            className="space-y-6"
            onSubmit={handleSubmit}
            noValidate
          >
            <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
              <UnlockingField label="Device brand" htmlFor="unlock-brand">
                <Input
                  id="unlock-brand"
                  value={form.deviceBrand}
                  onChange={(e) => update("deviceBrand", e.target.value)}
                  placeholder="e.g. Apple, Samsung"
                  className={fieldInputClass}
                  autoComplete="off"
                />
              </UnlockingField>

              <UnlockingField label="Device model" htmlFor="unlock-model">
                <Input
                  id="unlock-model"
                  value={form.deviceModel}
                  onChange={(e) => update("deviceModel", e.target.value)}
                  placeholder="e.g. iPhone 14 Pro, Galaxy S23"
                  className={fieldInputClass}
                  autoComplete="off"
                />
              </UnlockingField>

              <UnlockingField label="Network / carrier" htmlFor="unlock-carrier">
                <Input
                  id="unlock-carrier"
                  value={form.networkCarrier}
                  onChange={(e) => update("networkCarrier", e.target.value)}
                  placeholder="e.g. AT&T, Verizon, T-Mobile"
                  className={fieldInputClass}
                  autoComplete="off"
                />
              </UnlockingField>

              <UnlockingField
                label="IMEI number"
                htmlFor="unlock-imei"
                hint="Dial *#06# to find your IMEI number."
              >
                <Input
                  id="unlock-imei"
                  value={form.imei}
                  onChange={(e) => update("imei", e.target.value)}
                  placeholder="15-digit IMEI"
                  className={fieldInputClass}
                  inputMode="numeric"
                  autoComplete="off"
                />
              </UnlockingField>

              <div className="sm:col-span-2">
                <UnlockingField label="Unlocking type" htmlFor="unlock-type">
                  <Select
                    value={form.unlockingType || undefined}
                    onValueChange={(v) =>
                      update("unlockingType", (v ?? "") as UnlockingType | "")
                    }
                  >
                    <SelectTrigger id="unlock-type" className={selectTriggerClass}>
                      <SelectValue placeholder="Select unlocking type" />
                    </SelectTrigger>
                    <SelectContent>
                      {UNLOCKING_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </UnlockingField>
              </div>

              <div className="sm:col-span-2">
                <UnlockingField
                  label="Customer note / issue description"
                  htmlFor="unlock-note"
                >
                  <textarea
                    id="unlock-note"
                    value={form.customerNote}
                    onChange={(e) => update("customerNote", e.target.value)}
                    rows={4}
                    placeholder="Describe the lock issue or any details we should know..."
                    className={cn(fieldInputClass, "min-h-[100px] resize-y py-2")}
                  />
                </UnlockingField>
              </div>
            </div>

            <div className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3.5">
              <p className="text-sm font-medium text-[#374151]">
                Price will be confirmed after checking your device details.
              </p>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-[#E5E7EB] pt-6 sm:flex-row sm:justify-end">
              <Button
                type="submit"
                className="h-11 w-full rounded-md border-0 px-8 text-sm font-semibold text-[var(--repair-on-primary)] shadow-sm hover:opacity-90 sm:w-auto"
                style={{
                  background: `linear-gradient(135deg, var(--repair-primary) 0%, var(--repair-accent-end) 100%)`,
                }}
              >
                Continue / Book Now
              </Button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

function UnlockingField({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor} className="text-xs font-medium text-[#374151]">
        {label}
      </Label>
      {children}
      {hint ? <p className="text-xs text-[#6B7280]">{hint}</p> : null}
    </div>
  );
}
