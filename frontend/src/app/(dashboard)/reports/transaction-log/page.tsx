import type { Metadata } from "next";
import { Suspense } from "react";
import { TransactionLogPage } from "@/components/reports/transaction-log/transaction-log-page";

export const metadata: Metadata = {
  title: "Transaction Log | Reports",
  description: "View employee activity, sales events, shifts, and system actions",
};

export default function TransactionLogRoutePage() {
  return (
    <Suspense fallback={null}>
      <TransactionLogPage />
    </Suspense>
  );
}
