"use client";

import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InvoiceActionsProps {
  invoiceId: string;
}

export function InvoiceActions({ invoiceId }: InvoiceActionsProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      className="size-8 text-[#6B7280]"
      aria-label={`Actions for invoice ${invoiceId}`}
      onClick={() => {
        console.log("Invoice actions:", invoiceId);
      }}
    >
      <MoreHorizontal className="size-4" />
    </Button>
  );
}
