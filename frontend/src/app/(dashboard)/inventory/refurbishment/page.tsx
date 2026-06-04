import type { Metadata } from "next";
import { RefurbishmentBatchPage } from "@/components/inventory/refurbishment-batch/refurbishment-batch-page";

export const metadata: Metadata = {
  title: "Manage Refurbishment Batch",
  description: "Manage refurbishment batches, tickets, and batch status",
};

export default function RefurbishmentBatchRoutePage() {
  return <RefurbishmentBatchPage />;
}
