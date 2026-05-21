import type { Metadata } from "next";
import { RepairsPosView } from "@/components/repairs/repairs-pos-view";

export const metadata: Metadata = {
  title: "Repairs | Repair Management System",
  description: "Point of sale and repair ticket workflow",
};

export default function RepairsPage() {
  return <RepairsPosView />;
}
