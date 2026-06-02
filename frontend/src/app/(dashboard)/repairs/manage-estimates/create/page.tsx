import type { Metadata } from "next";
import { CreateEstimatePage } from "@/components/repairs/manage-estimates/create-estimate-page";

export const metadata: Metadata = {
  title: "Create Estimate | Repair Management System",
  description: "Create a new repair estimate",
};

export default function CreateEstimateRoutePage() {
  return <CreateEstimatePage />;
}
