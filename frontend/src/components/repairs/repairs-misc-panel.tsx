"use client";

import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { AlertCircle, ArrowUpFromLine, Wrench } from "lucide-react";
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
  MISC_CONTACT_METHOD_OPTIONS,
  MISC_FORM_DEFAULTS,
  MISC_SERVICE_TYPE_OPTIONS,
  MISC_URGENCY_OPTIONS,
  type MiscContactMethod,
  type MiscRequestFormValues,
  type MiscServiceType,
  type MiscUrgency,
} from "@/lib/repairs-misc-data";

const fieldInputClass =
  "h-10 w-full rounded-md border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:border-(--repair-primary) focus:outline-none focus:ring-1 focus:ring-(--repair-primary)";

const selectTriggerClass =
  "h-10 w-full rounded-md border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] shadow-none focus-visible:border-(--repair-primary) focus-visible:ring-1 focus-visible:ring-(--repair-primary)";

interface FormErrors {
  deviceBrand?: boolean;
  deviceModel?: boolean;
  serviceType?: boolean;
  issueDescription?: boolean;
  urgency?: boolean;
  customerName?: boolean;
  phoneNumber?: boolean;
  emailAddress?: boolean;
  preferredContact?: boolean;
}

type UploadField = "deviceImageName" | "damageImageName";

export function RepairsMiscPanel() {
  const [form, setForm] = useState<MiscRequestFormValues>({ ...MISC_FORM_DEFAULTS });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const update = <K extends keyof MiscRequestFormValues>(
    key: K,
    value: MiscRequestFormValues[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: false }));
  };

  const handleFileChange =
    (field: UploadField) => (e: ChangeEvent<HTMLInputElement>) => {
      update(field, e.target.files?.[0]?.name ?? "");
    };

  const validation = useMemo(() => {
    const nextErrors: FormErrors = {
      deviceBrand: !form.deviceBrand.trim(),
      deviceModel: !form.deviceModel.trim(),
      serviceType: !form.serviceType,
      issueDescription: !form.issueDescription.trim(),
      urgency: !form.urgency,
      customerName: !form.customerName.trim(),
      phoneNumber: !form.phoneNumber.trim(),
      emailAddress: !form.emailAddress.trim(),
      preferredContact: !form.preferredContact,
    };
    return { valid: !Object.values(nextErrors).some(Boolean), nextErrors };
  }, [form]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validation.valid) {
      setErrors(validation.nextErrors);
      toast.error("Please complete all required fields.");
      return;
    }
    setErrors({});
    setIsSubmitted(true);
    toast.success("Request submitted", {
      description:
        "Your request has been submitted. Our team will contact you shortly.",
    });
  };

  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col bg-white">
      <div className="min-h-0 flex-1 overflow-y-auto p-4 md:p-5">
        <div className="mx-auto w-full max-w-5xl">

          {/* Header */}
          <div className="mb-6 flex items-start gap-3">
            <div
              className="flex size-11 shrink-0 items-center justify-center rounded-lg"
              style={{
                background:
                  "linear-gradient(135deg, var(--repair-primary) 0%, var(--repair-accent-end) 100%)",
              }}
            >
              <Wrench className="size-5 text-(--repair-on-primary)" aria-hidden />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#111827]">
                Miscellaneous Service Request
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-[#6B7280]">
                Need something that is not listed? Tell us what service or issue you need
                help with, and our team will review your request.
              </p>
            </div>
          </div>

          {/* Info banner */}
          <div
            className="mb-6 flex gap-2.5 rounded-lg border border-[#FDE68A] bg-[#FFFBEB] px-3.5 py-3 text-sm text-[#92400E]"
            role="note"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
            <p>
              Some miscellaneous services may require inspection before confirming
              availability, price, and repair time.
            </p>
          </div>

          {/* Success message */}
          {isSubmitted ? (
            <div className="mb-6 rounded-lg border border-[#BBF7D0] bg-[#F0FDF4] px-4 py-3 text-sm text-[#166534]">
              Your request has been submitted. Our team will contact you shortly.
            </div>
          ) : null}

          <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">

              {/* Device Brand */}
              <MiscField label="Device Brand *" htmlFor="misc-brand">
                <Input
                  id="misc-brand"
                  value={form.deviceBrand}
                  onChange={(e) => update("deviceBrand", e.target.value)}
                  placeholder="e.g. Apple, Samsung"
                  className={cn(
                    fieldInputClass,
                    errors.deviceBrand &&
                      "border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]",
                  )}
                />
              </MiscField>

              {/* Device Model */}
              <MiscField label="Device Model *" htmlFor="misc-model">
                <Input
                  id="misc-model"
                  value={form.deviceModel}
                  onChange={(e) => update("deviceModel", e.target.value)}
                  placeholder="e.g. iPhone 14 Pro, Galaxy S23"
                  className={cn(
                    fieldInputClass,
                    errors.deviceModel &&
                      "border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]",
                  )}
                />
              </MiscField>

              {/* Service Type */}
              <MiscField label="Service Type *" htmlFor="misc-service-type">
                <Select
                  value={form.serviceType || undefined}
                  onValueChange={(v) =>
                    update("serviceType", (v ?? "") as MiscServiceType | "")
                  }
                >
                  <SelectTrigger
                    id="misc-service-type"
                    className={cn(
                      selectTriggerClass,
                      errors.serviceType &&
                        "border-[#EF4444] focus-visible:border-[#EF4444] focus-visible:ring-[#EF4444]",
                    )}
                  >
                    <SelectValue placeholder="Select service type" />
                  </SelectTrigger>
                  <SelectContent>
                    {MISC_SERVICE_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </MiscField>

              {/* Urgency */}
              <MiscField label="Urgency *" htmlFor="misc-urgency">
                <Select
                  value={form.urgency || undefined}
                  onValueChange={(v) =>
                    update("urgency", (v ?? "") as MiscUrgency | "")
                  }
                >
                  <SelectTrigger
                    id="misc-urgency"
                    className={cn(
                      selectTriggerClass,
                      errors.urgency &&
                        "border-[#EF4444] focus-visible:border-[#EF4444] focus-visible:ring-[#EF4444]",
                    )}
                  >
                    <SelectValue placeholder="Select urgency" />
                  </SelectTrigger>
                  <SelectContent>
                    {MISC_URGENCY_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </MiscField>

              {/* Issue Description – full width */}
              <div className="md:col-span-2">
                <MiscField
                  label="Issue Description *"
                  htmlFor="misc-description"
                >
                  <textarea
                    id="misc-description"
                    value={form.issueDescription}
                    onChange={(e) => update("issueDescription", e.target.value)}
                    rows={5}
                    placeholder="Describe the issue or service you need in as much detail as possible..."
                    className={cn(
                      fieldInputClass,
                      "min-h-[120px] resize-y py-2",
                      errors.issueDescription &&
                        "border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]",
                    )}
                  />
                </MiscField>
              </div>

              {/* Customer Name */}
              <MiscField label="Customer Name *" htmlFor="misc-customer-name">
                <Input
                  id="misc-customer-name"
                  value={form.customerName}
                  onChange={(e) => update("customerName", e.target.value)}
                  placeholder="Full name"
                  className={cn(
                    fieldInputClass,
                    errors.customerName &&
                      "border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]",
                  )}
                />
              </MiscField>

              {/* Phone Number */}
              <MiscField label="Phone Number *" htmlFor="misc-phone">
                <Input
                  id="misc-phone"
                  value={form.phoneNumber}
                  onChange={(e) => update("phoneNumber", e.target.value)}
                  placeholder="+1 555 123 4567"
                  className={cn(
                    fieldInputClass,
                    errors.phoneNumber &&
                      "border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]",
                  )}
                />
              </MiscField>

              {/* Email Address */}
              <MiscField label="Email Address *" htmlFor="misc-email">
                <Input
                  id="misc-email"
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
              </MiscField>

              {/* Preferred Contact Method */}
              <MiscField label="Preferred Contact Method *" htmlFor="misc-contact">
                <Select
                  value={form.preferredContact || undefined}
                  onValueChange={(v) =>
                    update("preferredContact", (v ?? "") as MiscContactMethod | "")
                  }
                >
                  <SelectTrigger
                    id="misc-contact"
                    className={cn(
                      selectTriggerClass,
                      errors.preferredContact &&
                        "border-[#EF4444] focus-visible:border-[#EF4444] focus-visible:ring-[#EF4444]",
                    )}
                  >
                    <SelectValue placeholder="Select contact method" />
                  </SelectTrigger>
                  <SelectContent>
                    {MISC_CONTACT_METHOD_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </MiscField>

              {/* Image uploads – full width */}
              <div className="md:col-span-2">
                <MiscField label="Upload Images">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <MiscFileCard
                      label="Device Image"
                      value={form.deviceImageName}
                      onChange={handleFileChange("deviceImageName")}
                    />
                    <MiscFileCard
                      label="Damage Image (Optional)"
                      value={form.damageImageName}
                      onChange={handleFileChange("damageImageName")}
                    />
                  </div>
                </MiscField>
              </div>
            </div>

            {/* Price note */}
            <div className="rounded-lg border border-[#E5E7EB] bg-pos-page px-4 py-3.5">
              <p className="text-sm font-medium text-[#374151]">
                Price will be confirmed after checking your device and service details.
              </p>
            </div>

            {/* Submit */}
            <div className="flex flex-col-reverse gap-3 border-t border-[#E5E7EB] pt-6 sm:flex-row sm:justify-end">
              <Button
                type="submit"
                className="h-11 w-full rounded-md border-0 px-8 text-sm font-semibold text-(--repair-on-primary) shadow-sm hover:opacity-90 sm:w-auto"
                style={{
                  background:
                    "linear-gradient(135deg, var(--repair-primary) 0%, var(--repair-accent-end) 100%)",
                }}
              >
                Submit Request
              </Button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

function MiscFileCard({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <label className="block cursor-pointer rounded-md border border-dashed border-[#D1D5DB] bg-pos-page p-3 transition-colors hover:border-(--repair-primary)">
      <span className="mb-2 block text-xs font-medium text-[#374151]">{label}</span>
      <div className="flex items-center justify-center gap-1.5 rounded-md border border-[#E5E7EB] bg-white px-3 py-2 text-xs text-[#6B7280]">
        <ArrowUpFromLine className="size-3.5" aria-hidden />
        <span className="truncate">{value || "Choose file"}</span>
      </div>
      <input type="file" accept="image/*" className="sr-only" onChange={onChange} />
    </label>
  );
}

function MiscField({
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
