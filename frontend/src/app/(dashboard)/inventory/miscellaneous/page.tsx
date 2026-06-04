import type { Metadata } from "next";
import { InventoryMiscellaneousPage } from "@/components/inventory/miscellaneous/inventory-miscellaneous-page";

export const metadata: Metadata = {
  title: "Miscellaneous | Inventory",
  description: "Manage miscellaneous inventory items",
};

export default function InventoryMiscellaneousRoutePage() {
  return <InventoryMiscellaneousPage />;
}
