import type { Metadata } from "next";
import { NewRefurbishmentBatchPage } from "@/components/inventory/refurbishment-batch/new-refurbishment-batch-page";

export const metadata: Metadata = {
  title: "Create Refurbishment Batch",
  description: "Create a new refurbishment batch",
};

export default function NewRefurbishmentBatchRoutePage() {
  return <NewRefurbishmentBatchPage />;
}
