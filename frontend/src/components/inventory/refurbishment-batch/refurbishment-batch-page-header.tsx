"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const createBtn =
  "h-9 gap-1.5 rounded-sm border-0 bg-(--repair-primary) px-4 text-sm font-semibold text-(--repair-on-primary) shadow-sm hover:opacity-90";

export function RefurbishmentBatchPageHeader() {
  const router = useRouter();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-2xl font-semibold tracking-tight text-[#111827] md:text-[26px]">
        Manage Refurbishment Batch
      </h1>
      <Button
        type="button"
        className={createBtn}
        onClick={() => router.push("/inventory/refurbishment/new")}
      >
        <Plus className="size-4" />
        Create Refurbishment Batch
      </Button>
    </div>
  );
}
