import type { Metadata } from "next";
import { NewInventoryCountPage } from "@/components/inventory/inventory-count/new-inventory-count-page";

export const metadata: Metadata = {
  title: "New Inventory Count",
  description: "Create a new inventory count session",
};

export default function NewInventoryCountRoutePage() {
  return <NewInventoryCountPage />;
}
