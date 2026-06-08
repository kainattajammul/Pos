import type { Metadata } from "next";
import dynamic from "next/dynamic";

const UnlockingProductFormPage = dynamic(
  () =>
    import("@/components/inventory/manage-services/unlocking-product-form-page").then(
      (m) => m.UnlockingProductFormPage,
    ),
  {
    loading: () => (
      <div className="flex min-h-[320px] flex-1 items-center justify-center bg-pos-page text-sm text-[#6B7280]">
        Loading…
      </div>
    ),
  },
);

export const metadata: Metadata = {
  title: "Add Unlocking Product",
  description: "Create a new unlocking service product",
};

export default function NewUnlockingProductRoutePage() {
  return <UnlockingProductFormPage mode="add" />;
}
