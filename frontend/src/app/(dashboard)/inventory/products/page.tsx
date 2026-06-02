import type { Metadata } from "next";
import { ProductsManagementView } from "@/components/inventory/products/products-management-view";

export const metadata: Metadata = {
  title: "Manage Products",
  description: "Manage products inventory with advanced filters and stock table",
};

export default function InventoryProductsPage() {
  return <ProductsManagementView />;
}
