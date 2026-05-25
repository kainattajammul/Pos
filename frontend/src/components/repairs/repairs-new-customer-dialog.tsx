"use client";

import { useEffect, useState, type ReactNode } from "react";
import { CloudUpload, Plus, X } from "lucide-react";
import {
  CUSTOMER_GROUP_OPTIONS,
  formatCustomerDisplayName,
  HEAR_ABOUT_US_OPTIONS,
  NEW_CUSTOMER_DEFAULTS,
  PHONE_TYPE_OPTIONS,
  TAX_CLASS_OPTIONS,
  type NewCustomerFormValues,
  type NewCustomerTab,
} from "@/lib/repairs-customer-data";
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
import { toast } from "sonner";

const fieldClass =
  "h-10 w-full rounded-md border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:border-[var(--repair-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--repair-primary)]";

const selectClass =
  "h-10 w-full rounded-md border border-[#E5E7EB] bg-white px-3 text-sm shadow-none focus-visible:border-[var(--repair-primary)] focus-visible:ring-1 focus-visible:ring-[var(--repair-primary)]";

interface RepairsNewCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (customer: NewCustomerFormValues & { displayName: string }) => void;
}

export function RepairsNewCustomerDialog({
  open,
  onOpenChange,
  onSave,
}: RepairsNewCustomerDialogProps) {
  const [tab, setTab] = useState<NewCustomerTab>("contact");
  const [form, setForm] = useState<NewCustomerFormValues>(NEW_CUSTOMER_DEFAULTS);

  useEffect(() => {
    if (open) {
      setForm(NEW_CUSTOMER_DEFAULTS);
      setTab("contact");
    }
  }, [open]);

  const update = <K extends keyof NewCustomerFormValues>(
    key: K,
    value: NewCustomerFormValues[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    if (!form.firstName.trim()) {
      toast.error("First name is required");
      setTab("contact");
      return;
    }
    const displayName = formatCustomerDisplayName(form.firstName, form.lastName);
    onSave?.({ ...form, displayName });
    onOpenChange(false);
    toast.success(`Customer "${displayName}" saved`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-black/55 supports-backdrop-filter:backdrop-blur-[2px]"
        className="flex max-h-[92vh] w-[calc(100%-2rem)] max-w-2xl flex-col gap-0 overflow-hidden rounded-lg border border-[#E5E7EB] bg-white p-0 shadow-xl sm:max-w-2xl"
      >
        <div className="flex shrink-0 items-start justify-between border-b border-[#E5E7EB] px-5 py-4">
          <DialogTitle className="text-lg font-semibold text-[#111827]">
            New Customer
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

        <div className="shrink-0 border-b border-[#E5E7EB] px-5">
          <nav className="flex gap-6" aria-label="Customer form sections">
            {(
              [
                ["contact", "Contact"],
                ["address", "Address"],
                ["additional", "Additional Details"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={cn(
                  "border-b-2 py-3 text-sm font-medium transition-colors",
                  tab === id
                    ? "border-[var(--repair-primary)] text-[var(--repair-primary)]"
                    : "border-transparent text-[#6B7280] hover:text-[#374151]",
                )}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {tab === "contact" ? (
            <ContactTab form={form} update={update} />
          ) : tab === "address" ? (
            <AddressTab form={form} update={update} />
          ) : (
            <AdditionalTab form={form} update={update} />
          )}
        </div>

        <div className="flex shrink-0 justify-center border-t border-[#E5E7EB] bg-[#FAFAFA] px-5 py-4">
          <Button
            type="button"
            onClick={handleSave}
            className="h-10 min-w-[140px] gap-2 rounded-md border-0 px-8 text-sm font-semibold text-[var(--repair-on-primary)] shadow-sm hover:opacity-90"
            style={{ backgroundColor: "var(--repair-primary)" }}
          >
            Save
            <CloudUpload className="size-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ContactTab({
  form,
  update,
}: {
  form: NewCustomerFormValues;
  update: <K extends keyof NewCustomerFormValues>(
    key: K,
    value: NewCustomerFormValues[K],
  ) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Customer Group">
          <Select
            value={form.customerGroup}
            onValueChange={(v) => update("customerGroup", v ?? "Individual")}
          >
            <SelectTrigger className={selectClass}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CUSTOMER_GROUP_OPTIONS.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        <FormField label="Tax Class">
          <Select
            value={form.taxClass || "none"}
            onValueChange={(v) => update("taxClass", v === "none" ? "" : (v ?? ""))}
          >
            <SelectTrigger className={selectClass}>
              <SelectValue placeholder="Select tax class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">—</SelectItem>
              {TAX_CLASS_OPTIONS.filter(Boolean).map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="First Name" required>
          <input
            type="text"
            value={form.firstName}
            onChange={(e) => update("firstName", e.target.value)}
            className={fieldClass}
            autoComplete="given-name"
          />
        </FormField>
        <FormField label="Last Name">
          <input
            type="text"
            value={form.lastName}
            onChange={(e) => update("lastName", e.target.value)}
            className={fieldClass}
            autoComplete="family-name"
          />
        </FormField>
      </div>

      <FormField label="Email">
        <input
          type="email"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          placeholder="someone@domain.com"
          className={fieldClass}
          autoComplete="email"
        />
      </FormField>

      <FormField label="Phone">
        <div className="flex flex-wrap gap-2">
          <Select
            value={form.phoneType}
            onValueChange={(v) => update("phoneType", v ?? "Mobile")}
          >
            <SelectTrigger className={cn(selectClass, "w-[108px] shrink-0")}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PHONE_TYPE_OPTIONS.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={form.phoneCountryCode}
            onValueChange={(v) => update("phoneCountryCode", v ?? "+1")}
          >
            <SelectTrigger className={cn(selectClass, "w-[88px] shrink-0")}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="+1">🇺🇸 +1</SelectItem>
              <SelectItem value="+44">🇬🇧 +44</SelectItem>
              <SelectItem value="+92">🇵🇰 +92</SelectItem>
            </SelectContent>
          </Select>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            placeholder="201-555-0123"
            className={cn(fieldClass, "min-w-[140px] flex-1")}
            autoComplete="tel"
          />
          <Button
            type="button"
            size="icon"
            className="size-10 shrink-0 border-0 text-[var(--repair-on-primary)] hover:opacity-90"
            style={{ backgroundColor: "var(--repair-primary)" }}
            aria-label="Add another phone"
          >
            <Plus className="size-4" />
          </Button>
        </div>
      </FormField>

      <FormField label="How did you hear about us?">
        <Select
          value={form.hearAboutUs || undefined}
          onValueChange={(v) => update("hearAboutUs", v === "none" ? "" : (v ?? ""))}
        >
          <SelectTrigger className={selectClass}>
            <SelectValue placeholder="Select Option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Select Option</SelectItem>
            {HEAR_ABOUT_US_OPTIONS.filter(Boolean).map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>

      <div className="flex items-center justify-between rounded-md border border-[#E5E7EB] bg-[#FAFAFA] px-4 py-3">
        <Label className="text-sm font-medium text-[#374151]">Email Alert</Label>
        <EmailAlertToggle
          checked={form.emailAlert}
          onCheckedChange={(v) => update("emailAlert", v)}
        />
      </div>
    </div>
  );
}

function AddressTab({
  form,
  update,
}: {
  form: NewCustomerFormValues;
  update: <K extends keyof NewCustomerFormValues>(
    key: K,
    value: NewCustomerFormValues[K],
  ) => void;
}) {
  return (
    <div className="space-y-4">
      <FormField label="Address Line 1">
        <input
          type="text"
          value={form.addressLine1}
          onChange={(e) => update("addressLine1", e.target.value)}
          className={fieldClass}
        />
      </FormField>
      <FormField label="Address Line 2">
        <input
          type="text"
          value={form.addressLine2}
          onChange={(e) => update("addressLine2", e.target.value)}
          className={fieldClass}
        />
      </FormField>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="City">
          <input
            type="text"
            value={form.city}
            onChange={(e) => update("city", e.target.value)}
            className={fieldClass}
          />
        </FormField>
        <FormField label="State">
          <input
            type="text"
            value={form.state}
            onChange={(e) => update("state", e.target.value)}
            className={fieldClass}
          />
        </FormField>
        <FormField label="ZIP / Postal Code">
          <input
            type="text"
            value={form.zip}
            onChange={(e) => update("zip", e.target.value)}
            className={fieldClass}
          />
        </FormField>
        <FormField label="Country">
          <input
            type="text"
            value={form.country}
            onChange={(e) => update("country", e.target.value)}
            className={fieldClass}
          />
        </FormField>
      </div>
    </div>
  );
}

function AdditionalTab({
  form,
  update,
}: {
  form: NewCustomerFormValues;
  update: <K extends keyof NewCustomerFormValues>(
    key: K,
    value: NewCustomerFormValues[K],
  ) => void;
}) {
  return (
    <div className="space-y-4">
      <FormField label="Referral Code">
        <input
          type="text"
          value={form.referralCode}
          onChange={(e) => update("referralCode", e.target.value)}
          className={fieldClass}
        />
      </FormField>
      <FormField label="Additional Notes">
        <textarea
          value={form.additionalNotes}
          onChange={(e) => update("additionalNotes", e.target.value)}
          rows={5}
          className={cn(fieldClass, "min-h-[120px] resize-y py-2")}
        />
      </FormField>
    </div>
  );
}

function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-[#374151]">
        {label}
        {required ? <span className="text-red-500">*</span> : null}
      </Label>
      {children}
    </div>
  );
}

function EmailAlertToggle({
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
        "relative inline-flex h-[22px] w-[40px] shrink-0 items-center rounded-full p-0.5 transition-colors",
        checked ? "bg-[var(--repair-primary)]" : "bg-[#C8C4DC]",
      )}
    >
      <span
        className={cn(
          "block size-[18px] rounded-full bg-white shadow-sm transition-transform",
          checked ? "translate-x-[18px]" : "translate-x-0",
        )}
      />
    </button>
  );
}
