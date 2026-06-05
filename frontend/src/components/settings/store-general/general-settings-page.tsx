"use client";

import {
  ChevronDown,
  CircleHelp,
  Loader2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { LogoUploadField } from "@/components/settings/store-general/logo-upload-field";
import { PhoneInputField } from "@/components/settings/store-general/phone-input-field";
import { Button } from "@/components/ui/button";
import { APP_CONFIG } from "@/constants/config";
import {
  useStoreGeneralSettings,
  useUpdateStoreGeneralSettings,
} from "@/hooks/use-store-settings";
import {
  DEFAULT_STORE_GENERAL_SETTINGS,
  STORE_DISPLAY_NAME,
  type StoreGeneralSettings,
} from "@/lib/store-settings-types";

const inputClass =
  "h-9 w-full rounded-sm border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:border-(--repair-primary) focus:outline-none focus:ring-1 focus:ring-(--repair-primary)";
const textareaClass =
  "min-h-[92px] w-full rounded-sm border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:border-(--repair-primary) focus:outline-none focus:ring-1 focus:ring-(--repair-primary)";

function RequiredLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-sm font-medium text-[#374151]">
      {children}
      <span className="ml-0.5 text-[#DC2626]">*</span>
    </span>
  );
}

function SettingsSection({
  title,
  badge,
  children,
}: {
  title: string;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-sm border border-[#E5E7EB] bg-white shadow-sm">
      <div className="border-b border-[#E5E7EB] px-5 py-3.5">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-[#111827]">{title}</h2>
          {badge ? (
            <span className="rounded bg-[#06B6D4] px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">
              {badge}
            </span>
          ) : null}
        </div>
      </div>
      <div className="px-5 py-5">{children}</div>
    </section>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
  clearable,
}: {
  label: React.ReactNode;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  clearable?: boolean;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-[#374151]">{label}</span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputClass} appearance-none pr-16`}
        >
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        {clearable ? (
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-8 top-1/2 -translate-y-1/2 rounded p-0.5 text-[#9CA3AF] hover:bg-[#F3F4F6]"
            aria-label={`Clear ${typeof label === "string" ? label : "selection"}`}
          >
            <X className="size-3.5" />
          </button>
        ) : null}
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-[#9CA3AF]" />
      </div>
    </label>
  );
}

function RadioRow({
  name,
  value,
  onChange,
  options,
}: {
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <div className="flex flex-wrap items-center gap-5">
      {options.map((option) => (
        <label key={option} className="inline-flex items-center gap-2 text-sm text-[#374151]">
          <input
            type="radio"
            name={name}
            checked={value === option}
            onChange={() => onChange(option)}
            className="size-4 border-[#D1D5DB] text-(--repair-primary) focus:ring-(--repair-primary)"
          />
          {option}
        </label>
      ))}
    </div>
  );
}

export function GeneralSettingsPage() {
  const shopId = APP_CONFIG.defaultShopId;
  const { data, isLoading } = useStoreGeneralSettings(shopId);
  const updateMutation = useUpdateStoreGeneralSettings(shopId);
  const [form, setForm] = useState<StoreGeneralSettings>(DEFAULT_STORE_GENERAL_SETTINGS);
  const [errors, setErrors] = useState<{ businessName?: string; storeEmail?: string }>({});

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  const setField = <K extends keyof StoreGeneralSettings>(
    key: K,
    value: StoreGeneralSettings[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validate = () => {
    const nextErrors: { businessName?: string; storeEmail?: string } = {};
    if (!form.businessName.trim()) nextErrors.businessName = "Business Name is required";
    if (!form.storeEmail.trim()) nextErrors.storeEmail = "Store Email is required";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleResetApiKey = () => {
    const token = crypto.randomUUID();
    setField("apiKey", token);
    toast.success("API key has been reset");
  };

  const handleVerifyEmail = () => {
    toast.success("Verification email sent", { description: form.verificationEmail });
  };

  const handleSave = () => {
    if (!validate()) {
      toast.error("Please fix required fields");
      return;
    }
    updateMutation.mutate(form);
  };

  return (
    <div className="mx-auto w-full max-w-[1100px] space-y-4 p-4 md:p-5">
      <header className="rounded-sm border border-[#E5E7EB] bg-white px-5 py-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-xl font-bold text-[#111827] md:text-2xl">General Settings</h1>
            <nav className="text-sm text-[#6B7280]" aria-label="Breadcrumb">
              <Link
                href="/dashboard"
                className="font-medium text-[#31A5A6] transition-colors hover:text-[#227E7F] hover:underline"
              >
                Home
              </Link>
              <span className="mx-1.5 text-[#9CA3AF]">/</span>
              <Link
                href="/settings/store/general"
                className="font-medium text-[#31A5A6] transition-colors hover:text-[#227E7F] hover:underline"
              >
                Settings
              </Link>
              <span className="mx-1.5 text-[#9CA3AF]">/</span>
              <Link
                href="/settings/store/manage"
                className="font-medium text-[#31A5A6] transition-colors hover:text-[#227E7F] hover:underline"
              >
                Stores
              </Link>
              <span className="mx-1.5 text-[#9CA3AF]">/</span>
              <span className="font-medium text-[#374151]">{STORE_DISPLAY_NAME}</span>
            </nav>
          </div>
        </div>
      </header>

      {isLoading ? (
        <div className="rounded-sm border border-[#E5E7EB] bg-white px-5 py-10 text-center text-sm text-[#6B7280]">
          Loading store settings…
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <SettingsSection title="Basic Information">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
              <div className="space-y-4">
                <label className="block space-y-1.5">
                  <RequiredLabel>Business Name</RequiredLabel>
                  <input
                    value={form.businessName}
                    onChange={(e) => setField("businessName", e.target.value)}
                    className={inputClass}
                  />
                  {errors.businessName ? (
                    <p className="text-xs text-[#DC2626]">{errors.businessName}</p>
                  ) : null}
                </label>
                <label className="block space-y-1.5">
                  <RequiredLabel>Store Email</RequiredLabel>
                  <input
                    type="email"
                    value={form.storeEmail}
                    onChange={(e) => setField("storeEmail", e.target.value)}
                    className={inputClass}
                  />
                  {errors.storeEmail ? (
                    <p className="text-xs text-[#DC2626]">{errors.storeEmail}</p>
                  ) : null}
                </label>
              </div>

              <div className="space-y-4">
                <label className="block space-y-1.5">
                  <span className="text-sm font-medium text-[#374151]">Alternate Name</span>
                  <input
                    value={form.alternateName}
                    onChange={(e) => setField("alternateName", e.target.value)}
                    className={inputClass}
                  />
                </label>
                <LogoUploadField
                  value={form.logoDataUrl}
                  onChange={(logoDataUrl) => setField("logoDataUrl", logoDataUrl)}
                />
              </div>
            </div>
          </SettingsSection>

          <SettingsSection title="Contact Information">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
              <div className="space-y-4">
                <PhoneInputField
                  label="Phone"
                  value={form.phone}
                  onChange={(phone) => setField("phone", phone)}
                />
                <PhoneInputField
                  label="Mobile"
                  value={form.mobile}
                  onChange={(mobile) => setField("mobile", mobile)}
                />
                <label className="block space-y-1.5">
                  <span className="text-sm font-medium text-[#374151]">Fax</span>
                  <input
                    value={form.fax}
                    onChange={(e) => setField("fax", e.target.value)}
                    className={inputClass}
                  />
                </label>
                <label className="block space-y-1.5">
                  <span className="text-sm font-medium text-[#374151]">Website</span>
                  <input
                    value={form.website}
                    onChange={(e) => setField("website", e.target.value)}
                    className={inputClass}
                  />
                </label>
                <label className="block space-y-1.5">
                  <span className="text-sm font-medium text-[#374151]">Address</span>
                  <input
                    value={form.address}
                    onChange={(e) => setField("address", e.target.value)}
                    className={inputClass}
                  />
                </label>
              </div>
              <div className="space-y-4">
                <label className="block space-y-1.5">
                  <span className="text-sm font-medium text-[#374151]">City</span>
                  <input
                    value={form.city}
                    onChange={(e) => setField("city", e.target.value)}
                    className={inputClass}
                  />
                </label>
                <label className="block space-y-1.5">
                  <span className="text-sm font-medium text-[#374151]">Postcode</span>
                  <input
                    value={form.postcode}
                    onChange={(e) => setField("postcode", e.target.value)}
                    className={inputClass}
                  />
                </label>
                <label className="block space-y-1.5">
                  <span className="text-sm font-medium text-[#374151]">State</span>
                  <input
                    value={form.state}
                    onChange={(e) => setField("state", e.target.value)}
                    className={inputClass}
                  />
                </label>
                <SelectField
                  label="Country"
                  value={form.country}
                  options={["United Kingdom", "United States", "Pakistan"]}
                  clearable
                  onChange={(value) => setField("country", value)}
                />
              </div>
            </div>
          </SettingsSection>

          <SettingsSection title="Other Information">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
              <div className="space-y-4">
                <SelectField
                  label="Time Zone"
                  value={form.timezone}
                  clearable
                  onChange={(value) => setField("timezone", value)}
                  options={[
                    "GMT +05:00 Karachi time (Asia/Karachi)",
                    "GMT +00:00 London (Europe/London)",
                  ]}
                />
                <SelectField
                  label="Time Format"
                  value={form.timeFormat}
                  onChange={(value) => setField("timeFormat", value as StoreGeneralSettings["timeFormat"])}
                  options={["12 hour", "24 hour"]}
                />
                <SelectField
                  label="Language"
                  value={form.language}
                  onChange={(value) => setField("language", value)}
                  options={["English", "Spanish"]}
                />
                <SelectField
                  label="Default Currency"
                  value={form.defaultCurrency}
                  clearable
                  onChange={(value) => setField("defaultCurrency", value)}
                  options={["Pound Sterling", "US Dollar", "Euro"]}
                />
                <SelectField
                  label="Price Format"
                  value={form.priceFormat}
                  onChange={(value) => setField("priceFormat", value as StoreGeneralSettings["priceFormat"])}
                  options={["Decimal", "Fraction"]}
                />
                <SelectField
                  label="Decimal Format"
                  value={form.decimalFormat}
                  onChange={(value) =>
                    setField("decimalFormat", value as StoreGeneralSettings["decimalFormat"])
                  }
                  options={["2 Decimal Places", "3 Decimal Places", "4 Decimal Places"]}
                />
                <div className="rounded-sm border border-[#BAE6FD] bg-[#EFF6FF] px-3 py-2 text-xs text-[#1E3A8A]">
                  Note: Select the number of decimal places for rounding. This change will only
                  affect the tax and total amounts in the Purchase Orders and GRN modules for now.
                </div>
                <SelectField
                  label="Do you charge Sales Tax?"
                  value={form.chargeSalesTax}
                  onChange={(value) =>
                    setField("chargeSalesTax", value as StoreGeneralSettings["chargeSalesTax"])
                  }
                  options={["No", "Yes"]}
                />
              </div>
              <div className="space-y-4">
                <label className="block space-y-1.5">
                  <span className="text-sm font-medium text-[#374151]">Registration No</span>
                  <input
                    value={form.registrationNo}
                    onChange={(e) => setField("registrationNo", e.target.value)}
                    className={inputClass}
                  />
                </label>
                <label className="block space-y-1.5">
                  <span className="text-sm font-medium text-[#374151]">Start Time</span>
                  <input
                    value={form.startTime}
                    onChange={(e) => setField("startTime", e.target.value)}
                    className={inputClass}
                  />
                </label>
                <label className="block space-y-1.5">
                  <span className="text-sm font-medium text-[#374151]">End Time</span>
                  <input
                    value={form.endTime}
                    onChange={(e) => setField("endTime", e.target.value)}
                    className={inputClass}
                  />
                </label>
                <label className="block space-y-1.5">
                  <span className="text-sm font-medium text-[#374151]">Default Address</span>
                  <textarea
                    value={form.defaultAddress}
                    onChange={(e) => setField("defaultAddress", e.target.value)}
                    className={textareaClass}
                  />
                </label>
                <div className="space-y-1.5">
                  <span className="text-sm font-medium text-[#374151]">API KEY</span>
                  <div className="rounded-sm border border-[#E5E7EB] bg-pos-page px-3 py-2 text-sm text-[#374151]">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="truncate">{form.apiKey}</span>
                      <button
                        type="button"
                        onClick={handleResetApiKey}
                        className="text-sm font-medium text-(--repair-primary) hover:underline"
                      >
                        reset
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SettingsSection>

          <SettingsSection title="Accounting Method">
            <p className="mb-3 text-sm text-[#6B7280]">Select a default method.</p>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-[#374151]">
                <input
                  type="radio"
                  checked={form.accountingMethod === "cash"}
                  onChange={() => setField("accountingMethod", "cash")}
                  className="size-4 border-[#D1D5DB] text-(--repair-primary) focus:ring-(--repair-primary)"
                />
                Cash basis
                <CircleHelp className="size-4 text-[#9CA3AF]" />
              </label>
              <label className="flex items-center gap-2 text-sm text-[#374151]">
                <input
                  type="radio"
                  checked={form.accountingMethod === "accrual"}
                  onChange={() => setField("accountingMethod", "accrual")}
                  className="size-4 border-[#D1D5DB] text-(--repair-primary) focus:ring-(--repair-primary)"
                />
                Accrual Basis
                <CircleHelp className="size-4 text-[#9CA3AF]" />
              </label>
            </div>
          </SettingsSection>

          <SettingsSection title="Email">
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
                <div className="space-y-1.5">
                  <p className="text-sm font-medium text-[#374151]">
                    Enter your company email address:
                  </p>
                  <p className="text-xs text-[#6B7280]">
                    We recommend using a company email address (example@yourdomain.com) for
                    better email delivery.
                  </p>
                  <input
                    type="email"
                    value={form.verificationEmail}
                    onChange={(e) => setField("verificationEmail", e.target.value)}
                    className={`${inputClass} max-w-lg`}
                  />
                  <button
                    type="button"
                    className="text-sm font-medium text-(--repair-primary) hover:underline"
                  >
                    Change Email
                  </button>
                </div>
                <Button
                  type="button"
                  className="h-9 rounded-sm border-0 bg-(--repair-primary) px-4 text-sm font-semibold text-(--repair-on-primary) hover:opacity-90"
                  onClick={handleVerifyEmail}
                >
                  Verify
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
                <p className="text-sm text-[#374151]">
                  Would you like to receive all emails within RepairDesk?
                </p>
                <RadioRow
                  name="receiveAllRepairdeskEmails"
                  value={form.receiveAllRepairdeskEmails}
                  onChange={(value) =>
                    setField(
                      "receiveAllRepairdeskEmails",
                      value as StoreGeneralSettings["receiveAllRepairdeskEmails"],
                    )
                  }
                  options={["Yes", "No"]}
                />
              </div>
            </div>
          </SettingsSection>

          <SettingsSection title="Security">
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <p className="text-sm font-medium text-[#374151]">
                  Required Two-factor Authentication (2FA)
                </p>
                <p className="text-xs text-[#6B7280]">
                  Require all users to set up 2FA to log-in.
                </p>
              </div>
              <RadioRow
                name="required2fa"
                value={form.required2fa}
                onChange={(value) =>
                  setField("required2fa", value as StoreGeneralSettings["required2fa"])
                }
                options={["Yes", "No"]}
              />
            </div>
          </SettingsSection>

          <SettingsSection title="Refund">
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
              <p className="text-sm font-medium text-[#374151]">
                Do you charge a restocking fee?
              </p>
              <RadioRow
                name="chargeRestockingFee"
                value={form.chargeRestockingFee}
                onChange={(value) =>
                  setField(
                    "chargeRestockingFee",
                    value as StoreGeneralSettings["chargeRestockingFee"],
                  )
                }
                options={["Yes", "No"]}
              />
            </div>
          </SettingsSection>

          <SettingsSection title="Deposit">
            <p className="mb-3 text-xs text-[#6B7280]">
              Charge diagnostic or bench fee from your customers while booking a repair job.
            </p>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
                <p className="text-sm font-medium text-[#374151]">
                  Do you charge deposit on repairs?
                </p>
                <RadioRow
                  name="chargeDepositOnRepairs"
                  value={form.chargeDepositOnRepairs}
                  onChange={(value) =>
                    setField(
                      "chargeDepositOnRepairs",
                      value as StoreGeneralSettings["chargeDepositOnRepairs"],
                    )
                  }
                  options={["Yes", "No"]}
                />
              </div>

              {form.chargeDepositOnRepairs === "Yes" ? (
                <div className="grid grid-cols-1 gap-4 rounded-sm border border-[#E5E7EB] bg-[#FAFAFA] p-4">
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_180px]">
                    <label className="space-y-1.5">
                      <span className="text-sm font-medium text-[#374151]">Enter deposit value</span>
                      <input
                        value={form.depositValue}
                        onChange={(e) => setField("depositValue", e.target.value)}
                        className={inputClass}
                      />
                    </label>
                    <SelectField
                      label=" "
                      value={form.depositType}
                      onChange={(value) =>
                        setField("depositType", value as StoreGeneralSettings["depositType"])
                      }
                      options={["Amount", "Percentage"]}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
                    <p className="text-sm font-medium text-[#374151]">
                      Do you charge tax on deposit amount?
                    </p>
                    <RadioRow
                      name="taxOnDeposit"
                      value={form.taxOnDeposit}
                      onChange={(value) =>
                        setField("taxOnDeposit", value as StoreGeneralSettings["taxOnDeposit"])
                      }
                      options={["Yes", "No"]}
                    />
                  </div>

                  <SelectField
                    label="Select Tax Class"
                    value={form.depositTaxClass}
                    onChange={(value) => setField("depositTaxClass", value)}
                    options={["", "Default Tax Class", "No Tax"]}
                  />

                  <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
                    <p className="text-sm font-medium text-[#374151]">
                      Check the &quot;Charge Deposit&quot; box by default
                      <CircleHelp className="ml-1 inline size-4 text-[#9CA3AF]" />
                      <span className="ml-2 rounded bg-[#06B6D4] px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">
                        NEW
                      </span>
                    </p>
                    <RadioRow
                      name="chargeDepositToggle"
                      value={form.chargeDepositToggle}
                      onChange={(value) =>
                        setField(
                          "chargeDepositToggle",
                          value as StoreGeneralSettings["chargeDepositToggle"],
                        )
                      }
                      options={["Yes", "No"]}
                    />
                  </div>
                </div>
              ) : null}
            </div>
          </SettingsSection>

          <SettingsSection title="Lock Screen" badge="NEW">
            <div className="space-y-3">
              <p className="text-sm font-semibold text-[#374151]">
                Screen Timeout Settings
                <CircleHelp className="ml-1 inline size-4 text-[#9CA3AF]" />
              </p>
              <SelectField
                label="Turn off the screen after"
                value={form.lockScreenTimeout}
                onChange={(value) =>
                  setField(
                    "lockScreenTimeout",
                    value as StoreGeneralSettings["lockScreenTimeout"],
                  )
                }
                options={["Never", "1 min", "5 min", "10 min"]}
              />
            </div>
          </SettingsSection>

          <Button
            type="button"
            className="h-10 self-end rounded-sm border-0 bg-(--repair-primary) px-5 text-sm font-semibold text-(--repair-on-primary) hover:opacity-90"
            onClick={handleSave}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 className="mr-1.5 size-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
