"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";

const STORAGE_KEY = "settings-billing-pricing-alert-dismissed-v1";

export function BillingPricingAlertBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(localStorage.getItem(STORAGE_KEY) !== "1");
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="flex items-center justify-between gap-3 rounded-sm border border-[#FECACA] bg-[#FEE2E2] px-4 py-3 md:px-5"
      role="alert"
    >
      <p className="text-sm font-medium text-[#991B1B]">
        Please contact support for pricing and offers
      </p>
      <button
        type="button"
        onClick={dismiss}
        className="shrink-0 rounded p-1 text-[#991B1B]/70 transition-colors hover:bg-[#FECACA] hover:text-[#991B1B]"
        aria-label="Dismiss alert"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
