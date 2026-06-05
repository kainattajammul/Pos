"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/utils/format";
import type { GoodsReceivedReviewData } from "@/components/inventory/goods-received/goods-received-types";

interface GoodsReceivedReviewCardProps {
  data: GoodsReceivedReviewData;
}

export function GoodsReceivedReviewCard({ data }: GoodsReceivedReviewCardProps) {
  const router = useRouter();
  const [isPosting, setIsPosting] = useState(false);

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.push("/inventory/summary");
  };

  const handlePostAdjustment = async () => {
    setIsPosting(true);
    try {
      await Promise.resolve();
      toast.success("Adjustment posted");
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <section className="rounded-md border border-[#E5E7EB] bg-white shadow-sm">
      <div className="space-y-0 p-4 md:p-6">
        <div className="grid gap-2 rounded-md bg-[#F3F4F6] px-4 py-3 text-[#374151] md:grid-cols-2 md:items-center">
          <p className="text-lg font-semibold leading-tight">
            Adjustment Type: {data.adjustmentType}
          </p>
          <p className="text-right text-lg font-semibold leading-tight">Date: {data.dateLabel}</p>
        </div>

        <div className="px-4 py-6">
          <div className="flex items-center justify-between gap-4 text-lg font-medium text-[#374151]">
            <span>New On-Hand Quantity</span>
            <span className="font-semibold">
              {data.newOnHandQuantity} {data.quantityFormula}
            </span>
          </div>
        </div>
        <div className="border-t border-[#E5E7EB]" />

        <div className="px-4 py-6">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-4">
              <p className="text-lg font-medium text-[#374151]">Average cost of adjustment</p>
              <span className="inline-flex rounded-md border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-1.5 text-sm font-medium text-[#4B5563]">
                Note: {data.note}
              </span>
            </div>
            <p className="text-2xl font-semibold text-[#374151]">
              {formatCurrency(data.averageCost)}
            </p>
          </div>
        </div>
        <div className="border-t border-[#E5E7EB]" />

        <div className="flex justify-end gap-3 px-4 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            className="h-10 rounded-md border-[#E5E7EB] px-6 text-sm font-semibold text-[#64748B] hover:bg-[#F8FAFC]"
          >
            Back
          </Button>
          <Button
            type="button"
            onClick={handlePostAdjustment}
            disabled={isPosting}
            className="h-10 rounded-md border-0 bg-(--repair-primary) px-6 text-sm font-semibold text-(--repair-on-primary) hover:opacity-90 disabled:opacity-70"
          >
            {isPosting ? "Posting..." : "Post Adjustment"}
          </Button>
        </div>
      </div>
    </section>
  );
}
