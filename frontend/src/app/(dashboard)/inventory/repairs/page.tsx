import type { Metadata } from "next";
import dynamic from "next/dynamic";

const RepairsServicesPage = dynamic(
  () =>
    import("@/components/inventory/manage-services/repairs-services-page").then(
      (m) => m.RepairsServicesPage,
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
  title: "Manage Services – Repairs",
  description: "Manage repair services pricing and configuration",
};

export default function RepairsServicesRoutePage() {
  return <RepairsServicesPage />;
}
