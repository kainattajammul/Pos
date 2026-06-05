"use client";

import Link from "next/link";
import { RepairsTopNav } from "@/components/repairs/repairs-top-nav";
import { GoodsReceivedReviewCard } from "@/components/inventory/goods-received/goods-received-review-card";
import { DEFAULT_GOODS_RECEIVED_REVIEW } from "@/components/inventory/goods-received/goods-received-types";

export function GoodsReceivedPage() {
  return (
    <div className="repairs-pos-theme flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-[#F8FAFC]">
      <RepairsTopNav />
      <main className="flex-1 overflow-auto">
        <div className="mx-auto w-full max-w-[1600px] space-y-4 p-4 md:p-5">
          <nav className="text-sm text-[#6B7280]" aria-label="Breadcrumb">
            <Link
              href="/dashboard"
              className="font-medium text-[#31A5A6] transition-colors hover:text-[#227E7F] hover:underline"
            >
              Home
            </Link>
            <span className="mx-1.5 text-[#9CA3AF]">/</span>
            <Link
              href="/inventory/products"
              className="font-medium text-[#31A5A6] transition-colors hover:text-[#227E7F] hover:underline"
            >
              Inventory
            </Link>
            <span className="mx-1.5 text-[#9CA3AF]">/</span>
            <span className="font-medium text-[#374151]">Goods Received Note</span>
          </nav>

          <header>
            <h1 className="text-xl font-semibold text-[#111827] md:text-2xl">Review Adjustment</h1>
          </header>

          <GoodsReceivedReviewCard data={DEFAULT_GOODS_RECEIVED_REVIEW} />
        </div>
      </main>
    </div>
  );
}
