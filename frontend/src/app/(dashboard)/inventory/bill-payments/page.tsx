import type { Metadata } from "next";
import { Suspense } from "react";
import { BillPaymentsPage } from "@/components/inventory/bill-payments/bill-payments-page";

export const metadata: Metadata = {
  title: "Bill Payments | Manage Inventory",
  description: "Manage bill payment inventory items, plans, and provider settings",
};

export default function InventoryBillPaymentsRoutePage() {
  return (
    <Suspense fallback={<div className="min-h-[40vh] animate-pulse bg-pos-page" />}>
      <BillPaymentsPage />
    </Suspense>
  );
}
