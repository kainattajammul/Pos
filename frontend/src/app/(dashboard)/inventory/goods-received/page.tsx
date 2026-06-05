import type { Metadata } from "next";
import { GoodsReceivedPage } from "@/components/inventory/goods-received/goods-received-page";

export const metadata: Metadata = {
  title: "Goods Received Note",
  description: "Review and post goods received note stock adjustments",
};

export default function GoodsReceivedRoutePage() {
  return <GoodsReceivedPage />;
}
