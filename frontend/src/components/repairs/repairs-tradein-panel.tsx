"use client";

import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { AlertCircle, ArrowUpFromLine, HandCoins } from "lucide-react";
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
  TRADE_IN_ACCESSORY_OPTIONS,
  TRADE_IN_BATTERY_HEALTH_OPTIONS,
  TRADE_IN_CONDITION_OPTIONS,
  TRADE_IN_FORM_DEFAULTS,
  TRADE_IN_NETWORK_STATUS_OPTIONS,
  TRADE_IN_STORAGE_OPTIONS,
  type TradeInAccessory,
  type TradeInBatteryHealth,
  type TradeInCondition,
  type TradeInNetworkStatus,
  type TradeInRequestFormValues,
  type TradeInStorageCapacity,
} from "@/lib/repairs-tradein-data";

const fieldInputClass =
  "h-10 w-full rounded-md border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:border-[var(--repair-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--repair-primary)]";

const selectTriggerClass =
  "h-10 w-full rounded-md border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] shadow-none focus-visible:border-[var(--repair-primary)] focus-visible:ring-1 focus-visible:ring-[var(--repair-primary)]";

interface FormErrors {
  deviceBrand?: boolean;
  deviceModel?: boolean;
  storageCapacity?: boolean;
  condition?: boolean;
  networkStatus?: boolean;
  batteryHealth?: boolean;
  imeiNumber?: boolean;
  customerName?: boolean;
  phoneNumber?: boolean;
  emailAddress?: boolean;
}

type UploadField = "frontImageName" | "backImageName" | "damageImageName";

export function RepairsTradeInPanel() {
  const [form, setForm] = useState<TradeInRequestFormValues>({
    ...TRADE_IN_FORM_DEFAULTS,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const update = <K extends keyof TradeInRequestFormValues>(
    key: K,
    value: TradeInRequestFormValues[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: false }));
  };

  const toggleAccessory = (accessory: TradeInAccessory) => {
    setForm((prev) => {
      const current = prev.accessoriesIncluded;
      if (accessory === "None") {
        return { ...prev, accessoriesIncluded: ["None"] };
      }

      const withoutNone = current.filter((item) => item !== "None");
      const hasAccessory = withoutNone.includes(accessory);
      return {
        ...prev,
        accessoriesIncluded: hasAccessory
          ? withoutNone.filter((item) => item !== accessory)
          : [...withoutNone, accessory],
      };
    });
  };

  const handleFileChange =
    (field: UploadField) => (e: ChangeEvent<HTMLInputElement>) => {
      const fileName = e.target.files?.[0]?.name ?? "";
      update(field, fileName);
    };

  const isFormValid = useMemo(() => {
    const nextErrors: FormErrors = {
      deviceBrand: !form.deviceBrand.trim(),
      deviceModel: !form.deviceModel.trim(),
      storageCapacity: !form.storageCapacity,
      condition: !form.condition,
      networkStatus: !form.networkStatus,
      batteryHealth: !form.batteryHealth,
      imeiNumber: !form.imeiNumber.trim(),
      customerName: !form.customerName.trim(),
      phoneNumber: !form.phoneNumber.trim(),
      emailAddress: !form.emailAddress.trim(),
    };
    return { valid: !Object.values(nextErrors).some(Boolean), nextErrors };
  }, [form]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!isFormValid.valid) {
      setErrors(isFormValid.nextErrors);
      toast.error("Please complete all required fields.");
      return;
    }

    setErrors({});
    setIsSubmitted(true);
    toast.success("Trade-in request submitted", {
      description:
        "Your trade-in request has been submitted. Our team will contact you with a quote.",
    });
  };

  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col bg-white">
      <div className="min-h-0 flex-1 overflow-y-auto p-4 md:p-5">
        <div className="mx-auto w-full max-w-5xl">
          <div className="mb-6 flex items-start gap-3">
            <div
              className="flex size-11 shrink-0 items-center justify-center rounded-lg"
              style={{
                background:
                  "linear-gradient(135deg, var(--repair-primary) 0%, var(--repair-accent-end) 100%)",
              }}
            >
              <HandCoins className="size-5 text-(--repair-on-primary)" aria-hidden />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#111827]">Trade In Your Device</h2>
              <p className="mt-1 text-sm leading-relaxed text-[#6B7280]">
                Sell or exchange your old device. Enter your device details and our team
                will confirm the best trade-in value.
              </p>
            </div>
          </div>

          <div
            className="mb-6 flex gap-2.5 rounded-lg border border-[#FDE68A] bg-[#FFFBEB] px-3.5 py-3 text-sm text-[#92400E]"
            role="note"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
            <p>
              Final trade-in value depends on device condition, lock status, storage, and
              inspection.
            </p>
          </div>

          {isSubmitted ? (
            <div className="mb-6 rounded-lg border border-[#BBF7D0] bg-[#F0FDF4] px-4 py-3 text-sm text-[#166534]">
              Your trade-in request has been submitted. Our team will contact you with a
              quote.
            </div>
          ) : null}

          <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
              <TradeInField label="Device Brand *" htmlFor="tradein-brand">
                <Input
                  id="tradein-brand"
                  value={form.deviceBrand}
                  onChange={(e) => update("deviceBrand", e.target.value)}
                  placeholder="e.g. Apple, Samsung"
                  className={cn(
                    fieldInputClass,
                    errors.deviceBrand &&
                      "border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]",
                  )}
                />
              </TradeInField>

              <TradeInField label="Device Model *" htmlFor="tradein-model">
                <Input
                  id="tradein-model"
                  value={form.deviceModel}
                  onChange={(e) => update("deviceModel", e.target.value)}
                  placeholder="e.g. iPhone 13 Pro"
                  className={cn(
                    fieldInputClass,
                    errors.deviceModel &&
                      "border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]",
                  )}
                />
              </TradeInField>

              <TradeInField label="Storage Capacity *" htmlFor="tradein-storage">
                <Select
                  value={form.storageCapacity || undefined}
                  onValueChange={(v) =>
                    update("storageCapacity", (v ?? "") as TradeInStorageCapacity | "")
                  }
                >
                  <SelectTrigger
                    id="tradein-storage"
                    className={cn(
                      selectTriggerClass,
                      errors.storageCapacity &&
                        "border-[#EF4444] focus-visible:border-[#EF4444] focus-visible:ring-[#EF4444]",
                    )}
                  >
                    <SelectValue placeholder="Select storage capacity" />
                  </SelectTrigger>
                  <SelectContent>
                    {TRADE_IN_STORAGE_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TradeInField>

              <TradeInField label="Device Condition *" htmlFor="tradein-condition">
                <Select
                  value={form.condition || undefined}
                  onValueChange={(v) => update("condition", (v ?? "") as TradeInCondition | "")}
                >
                  <SelectTrigger
                    id="tradein-condition"
                    className={cn(
                      selectTriggerClass,
                      errors.condition &&
                        "border-[#EF4444] focus-visible:border-[#EF4444] focus-visible:ring-[#EF4444]",
                    )}
                  >
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    {TRADE_IN_CONDITION_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TradeInField>

              <TradeInField label="Network Status *" htmlFor="tradein-network">
                <Select
                  value={form.networkStatus || undefined}
                  onValueChange={(v) =>
                    update("networkStatus", (v ?? "") as TradeInNetworkStatus | "")
                  }
                >
                  <SelectTrigger
                    id="tradein-network"
                    className={cn(
                      selectTriggerClass,
                      errors.networkStatus &&
                        "border-[#EF4444] focus-visible:border-[#EF4444] focus-visible:ring-[#EF4444]",
                    )}
                  >
                    <SelectValue placeholder="Select network status" />
                  </SelectTrigger>
                  <SelectContent>
                    {TRADE_IN_NETWORK_STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TradeInField>

              <TradeInField label="Battery Health *" htmlFor="tradein-battery">
                <Select
                  value={form.batteryHealth || undefined}
                  onValueChange={(v) =>
                    update("batteryHealth", (v ?? "") as TradeInBatteryHealth | "")
                  }
                >
                  <SelectTrigger
                    id="tradein-battery"
                    className={cn(
                      selectTriggerClass,
                      errors.batteryHealth &&
                        "border-[#EF4444] focus-visible:border-[#EF4444] focus-visible:ring-[#EF4444]",
                    )}
                  >
                    <SelectValue placeholder="Select battery health" />
                  </SelectTrigger>
                  <SelectContent>
                    {TRADE_IN_BATTERY_HEALTH_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TradeInField>

              <div className="md:col-span-2">
                <TradeInField label="Accessories Included" htmlFor="tradein-accessories">
                  <div
                    id="tradein-accessories"
                    className="grid grid-cols-1 gap-2 rounded-md border border-[#E5E7EB] bg-pos-page p-3 sm:grid-cols-2 lg:grid-cols-3"
                  >
                    {TRADE_IN_ACCESSORY_OPTIONS.map((item) => {
                      const checked = form.accessoriesIncluded.includes(item);
                      return (
                        <label
                          key={item}
                          className="flex items-center gap-2 text-sm text-[#374151]"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleAccessory(item)}
                            className="size-4 rounded border-[#D1D5DB] text-(--repair-primary) focus:ring-(--repair-primary)"
                          />
                          <span>{item}</span>
                        </label>
                      );
                    })}
                  </div>
                </TradeInField>
              </div>

              <TradeInField
                label="IMEI Number *"
                htmlFor="tradein-imei"
                hint="Dial *#06# to find your IMEI number."
              >
                <Input
                  id="tradein-imei"
                  value={form.imeiNumber}
                  onChange={(e) => update("imeiNumber", e.target.value)}
                  placeholder="15-digit IMEI"
                  className={cn(
                    fieldInputClass,
                    errors.imeiNumber &&
                      "border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]",
                  )}
                  inputMode="numeric"
                />
              </TradeInField>

              <TradeInField label="Customer Name *" htmlFor="tradein-customer-name">
                <Input
                  id="tradein-customer-name"
                  value={form.customerName}
                  onChange={(e) => update("customerName", e.target.value)}
                  placeholder="Full name"
                  className={cn(
                    fieldInputClass,
                    errors.customerName &&
                      "border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]",
                  )}
                />
              </TradeInField>

              <TradeInField label="Phone Number *" htmlFor="tradein-phone">
                <Input
                  id="tradein-phone"
                  value={form.phoneNumber}
                  onChange={(e) => update("phoneNumber", e.target.value)}
                  placeholder="+1 555 123 4567"
                  className={cn(
                    fieldInputClass,
                    errors.phoneNumber &&
                      "border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]",
                  )}
                />
              </TradeInField>

              <TradeInField label="Email Address *" htmlFor="tradein-email">
                <Input
                  id="tradein-email"
                  type="email"
                  value={form.emailAddress}
                  onChange={(e) => update("emailAddress", e.target.value)}
                  placeholder="name@example.com"
                  className={cn(
                    fieldInputClass,
                    errors.emailAddress &&
                      "border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]",
                  )}
                />
              </TradeInField>

              <div className="md:col-span-2">
                <TradeInField label="Upload Device Images">
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <FileInputCard
                      label="Front Image"
                      value={form.frontImageName}
                      onChange={handleFileChange("frontImageName")}
                    />
                    <FileInputCard
                      label="Back Image"
                      value={form.backImageName}
                      onChange={handleFileChange("backImageName")}
                    />
                    <FileInputCard
                      label="Damage Image (Optional)"
                      value={form.damageImageName}
                      onChange={handleFileChange("damageImageName")}
                    />
                  </div>
                </TradeInField>
              </div>

              <div className="md:col-span-2">
                <TradeInField label="Customer Note / Extra Details" htmlFor="tradein-note">
                  <textarea
                    id="tradein-note"
                    value={form.customerNote}
                    onChange={(e) => update("customerNote", e.target.value)}
                    rows={4}
                    placeholder="Share any extra details about condition, repairs, or issues..."
                    className={cn(fieldInputClass, "min-h-[100px] resize-y py-2")}
                  />
                </TradeInField>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-[#E5E7EB] pt-6 sm:flex-row sm:justify-end">
              <Button
                type="submit"
                className="h-11 w-full rounded-md border-0 px-8 text-sm font-semibold text-(--repair-on-primary) shadow-sm hover:opacity-90 sm:w-auto"
                style={{
                  background:
                    "linear-gradient(135deg, var(--repair-primary) 0%, var(--repair-accent-end) 100%)",
                }}
              >
                Get Trade-In Quote
              </Button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

function FileInputCard({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <label className="group block cursor-pointer rounded-md border border-dashed border-[#D1D5DB] bg-pos-page p-3 transition-colors hover:border-(--repair-primary)">
      <span className="mb-2 block text-xs font-medium text-[#374151]">{label}</span>
      <div className="flex items-center justify-center gap-1.5 rounded-md border border-[#E5E7EB] bg-white px-3 py-2 text-xs text-[#6B7280]">
        <ArrowUpFromLine className="size-3.5" aria-hidden />
        <span className="truncate">{value || "Choose file"}</span>
      </div>
      <input type="file" accept="image/*" className="sr-only" onChange={onChange} />
    </label>
  );
}

function TradeInField({
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
