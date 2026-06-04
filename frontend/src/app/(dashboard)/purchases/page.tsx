import type { Metadata } from "next";
import { PurchaseOrdersPage } from "@/components/inventory/purchase-orders/purchase-orders-page";

export const metadata: Metadata = {
  title: "Manage Purchase Orders",
  description: "Manage purchase orders, suppliers, payments, and tracking",
};

export default function PurchasesRoutePage() {
  return <PurchaseOrdersPage />;
}
