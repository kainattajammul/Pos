import type { Metadata } from "next";
import { NewPurchaseOrderPage } from "@/components/inventory/purchase-orders/new-purchase-order-page";

export const metadata: Metadata = {
  title: "Create Purchase Order",
  description: "Create a new purchase order",
};

export default function NewPurchaseOrderRoutePage() {
  return <NewPurchaseOrderPage />;
}
