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
  title: "Edit Unlocking Product",
  description: "Edit unlocking service product details",
};

interface EditUnlockingProductRoutePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditUnlockingProductRoutePage({
  params,
}: EditUnlockingProductRoutePageProps) {
  const { id } = await params;
  return <UnlockingProductFormPage mode="edit" id={id} />;
}
