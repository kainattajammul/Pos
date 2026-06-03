import type { Metadata } from "next";
import { NewProductPageView } from "@/components/inventory/products/new-product-page-view";

export const metadata: Metadata = {
  title: "New Product",
  description: "Create a new inventory product",
};

export default function NewProductPage() {
  return <NewProductPageView />;
}

