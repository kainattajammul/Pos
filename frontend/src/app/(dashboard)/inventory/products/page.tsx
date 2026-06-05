import type { Metadata } from "next";
import dynamic from "next/dynamic";

const ProductsManagementView = dynamic(
  () =>
    import("@/components/inventory/products/products-management-view").then(
      (m) => m.ProductsManagementView,
    ),
  {
    loading: () => (
      <div className="flex min-h-[320px] items-center justify-center bg-pos-page text-sm text-[#6B7280]">
        Loading products…
      </div>
    ),
  },
);

export const metadata: Metadata = {
  title: "Manage Products",
  description: "Manage products inventory with advanced filters and stock table",
};

export default function InventoryProductsPage() {
  return <ProductsManagementView />;
}
