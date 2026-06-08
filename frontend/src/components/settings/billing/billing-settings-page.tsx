"use client";

import { Info, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { toast } from "sonner";
import { BillingPricingAlertBanner } from "@/components/settings/billing/billing-alert-banner";
import { BillingStatCards } from "@/components/settings/billing/billing-stat-cards";
import { Button } from "@/components/ui/button";
import { APP_CONFIG } from "@/constants/config";
import { useBillingSummary } from "@/hooks/use-billing";
import { useStoreGeneralSettings } from "@/hooks/use-store-settings";
import { STORE_DISPLAY_NAME } from "@/lib/store-settings-types";

const BILLING_DETAILS_ROWS = [
  { label: "Company Name", key: "companyName" as const },
  { label: "Current Billing Cycle", key: "billingCycle" as const },
  { label: "Free Days Left", key: "freeDaysLeft" as const },
];

export function BillingSettingsPage() {
  const router = useRouter();
  const shopId = APP_CONFIG.defaultShopId;
  const { data: storeSettings } = useStoreGeneralSettings(shopId);
  const companyName =
    storeSettings?.businessName?.trim() || STORE_DISPLAY_NAME;

  const { data: billing, isLoading } = useBillingSummary(companyName);

  const detailValues = useMemo(
    () => ({
      companyName: billing?.companyName ?? companyName,
      billingCycle: billing?.billingCycle ?? "—",
      freeDaysLeft: billing?.freeDaysLeft ?? "—",
    }),
    [billing, companyName],
  );

  const openInvoiceCount = billing?.openInvoices.length ?? 0;

  const handleAddBillingDetails = () => {
    toast.message("Add Billing Details — connect subscription flow when ready");
  };

  return (
    <div className="mx-auto w-full max-w-[1100px] space-y-4 p-4 md:p-5">
      <header className="rounded-sm border border-[#E5E7EB] bg-white px-5 py-4 shadow-sm">
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-[#111827] md:text-2xl">Billing</h1>
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
            <span className="font-medium text-[#374151]">Billing</span>
          </nav>
        </div>
      </header>

      <BillingPricingAlertBanner />

      {isLoading ? (
        <div className="flex min-h-[200px] items-center justify-center rounded-sm border border-[#E5E7EB] bg-white">
          <Loader2 className="size-8 animate-spin text-(--repair-primary)" />
        </div>
      ) : (
        <>
          <section className="overflow-hidden rounded-sm border border-[#E5E7EB] bg-white shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-[220px_1fr]">
              <div
                className="flex min-h-[180px] flex-col items-center justify-center px-6 py-8 text-center text-white md:min-h-[220px]"
                style={{ backgroundColor: "#2563EB" }}
              >
                <p className="text-sm font-medium opacity-90">Your current package</p>
                <p className="mt-2 text-4xl font-bold tracking-tight">
                  {billing?.packageName ?? "Trial"}
                </p>
              </div>

              <div className="min-w-0">
                <div className="border-b border-[#E5E7EB] bg-[#FAFAFA] px-5 py-3">
                  <h2 className="text-base font-semibold text-[#111827]">Billing Details</h2>
                </div>
                <div className="divide-y divide-[#E5E7EB]">
                  {BILLING_DETAILS_ROWS.map((row) => (
                    <div
                      key={row.key}
                      className="flex flex-col gap-1 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <span className="text-sm font-medium text-[#374151]">{row.label}</span>
                      <span
                        className={
                          row.key === "freeDaysLeft" && billing?.freeDaysExpired
                            ? "text-sm font-semibold text-[#DC2626]"
                            : "text-sm text-[#111827]"
                        }
                      >
                        {detailValues[row.key]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-sm border border-[#FEF08A] bg-[#FEF9C3] px-5 py-5 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex items-start gap-2">
                  <Info className="mt-0.5 size-5 shrink-0 text-[#92400E]" aria-hidden />
                  <div>
                    <h2 className="text-base font-bold text-[#111827]">
                      Fill in your billing details
                    </h2>
                    <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#374151]">
                      Do you want to go pro and enjoy countless features? If yes then please
                      enter your billing information to subscribe to one of our packages. Once
                      you enter your billing information we will charge immediately according
                      to your plan and number of users.
                    </p>
                  </div>
                </div>
              </div>
              <Button
                type="button"
                className="h-10 shrink-0 rounded-sm bg-(--repair-primary) px-5 font-semibold text-white hover:opacity-90"
                onClick={handleAddBillingDetails}
              >
                Add Billing Details
              </Button>
            </div>
          </section>

          <BillingStatCards
            items={[
              {
                title: "Store Location",
                value: `${billing?.storeLocationsUsed ?? 1}/${billing?.storeLocationsLimit ?? 1}`,
              },
              {
                title: "Users",
                value: `${billing?.usersUsed ?? 1}/${billing?.usersLimit ?? 3}`,
              },
              {
                title: "Open Invoices",
                value: String(openInvoiceCount),
                actionLabel: "View",
                onAction: () => router.push("/settings/billing/invoices"),
              },
            ]}
          />
        </>
      )}
    </div>
  );
}
