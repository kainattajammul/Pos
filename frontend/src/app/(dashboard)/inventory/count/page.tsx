import type { Metadata } from "next";
import { InventoryCountPage } from "@/components/inventory/inventory-count/inventory-count-page";

export const metadata: Metadata = {
  title: "Manage Inventory Count",
  description: "Manage inventory counts, variances, and adjustment reports",
};

export default function InventoryCountRoutePage() {
  return <InventoryCountPage />;
}
