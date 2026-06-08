import type { Metadata } from "next";
import dynamic from "next/dynamic";

const UnlockingServicesPage = dynamic(
  () =>
    import("@/components/inventory/manage-services/unlocking-services-page").then(
      (m) => m.UnlockingServicesPage,
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
  title: "Unlocking | Manage Services",
  description: "Manage unlocking service products, pricing, and costs",
};

export default function UnlockingServicesRoutePage() {
  return <UnlockingServicesPage />;
}
