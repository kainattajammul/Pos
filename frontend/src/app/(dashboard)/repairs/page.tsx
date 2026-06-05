import type { Metadata } from "next";
import dynamic from "next/dynamic";

const RepairsPosView = dynamic(
  () =>
    import("@/components/repairs/repairs-pos-view").then((m) => m.RepairsPosView),
  {
    loading: () => (
      <div className="flex h-full min-h-[320px] items-center justify-center bg-pos-page text-sm text-[#6B7280]">
        Loading repairs…
      </div>
    ),
  },
);

export const metadata: Metadata = {
  title: "Repairs | Repair Management System",
  description: "Point of sale and repair ticket workflow",
};

export default function RepairsPage() {
  return <RepairsPosView />;
}
