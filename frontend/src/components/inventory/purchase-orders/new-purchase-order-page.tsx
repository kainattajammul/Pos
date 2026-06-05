"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { RepairsTopNav } from "@/components/repairs/repairs-top-nav";
import { Button } from "@/components/ui/button";

export function NewPurchaseOrderPage() {
  const router = useRouter();

  return (
    <div className="repairs-pos-theme flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-pos-page">
      <RepairsTopNav />
      <main className="flex-1 overflow-auto">
        <div className="mx-auto w-full max-w-[800px] space-y-4 p-4 md:p-5">
          <nav className="text-sm text-[#6B7280]" aria-label="Breadcrumb">
            <Link
              href="/dashboard"
              className="font-medium text-[#31A5A6] hover:text-[#227E7F] hover:underline"
            >
              Home
            </Link>
            <span className="mx-1.5 text-[#9CA3AF]">/</span>
            <Link
              href="/purchases"
              className="font-medium text-[#31A5A6] hover:text-[#227E7F] hover:underline"
            >
              Manage Purchase Orders
            </Link>
            <span className="mx-1.5 text-[#9CA3AF]">/</span>
            <span className="font-medium text-[#374151]">Create Purchase Order</span>
          </nav>

          <section className="rounded-sm border border-[#E5E7EB] bg-white p-6 shadow-sm">
            <h1 className="text-xl font-semibold text-[#111827]">Create Purchase Order</h1>
            <p className="mt-2 text-sm text-[#6B7280]">
              Create form will connect to the API when the purchase order backend is ready.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                className="h-9 gap-1.5 rounded-sm border-[#E5E7EB] bg-white"
                onClick={() => router.push("/purchases")}
              >
                <ChevronLeft className="size-4" />
                Back to list
              </Button>
              <Button
                type="button"
                className="h-9 rounded-sm border-0 bg-(--repair-primary) px-4 text-sm font-semibold text-(--repair-on-primary) hover:opacity-90"
                onClick={() => {
                  toast.success("Purchase order created (preview)");
                  router.push("/purchases");
                }}
              >
                Save order
              </Button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
