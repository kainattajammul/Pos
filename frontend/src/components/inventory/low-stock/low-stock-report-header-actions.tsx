"use client";

import { FileSpreadsheet, FileText, Printer } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const exportBtn =
  "h-9 gap-1.5 rounded-sm border border-[#E5E7EB] bg-white px-3 text-sm font-medium text-[#374151] shadow-sm hover:bg-pos-page";

export function LowStockReportHeaderActions() {
  const handleExport = (format: "CSV" | "PDF" | "Print") => {
    toast.message(`${format} export — coming soon`);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        variant="outline"
        className={cn(exportBtn)}
        onClick={() => handleExport("CSV")}
      >
        <FileSpreadsheet className="size-4 text-[#217346]" aria-hidden />
        CSV
      </Button>
      <Button
        type="button"
        variant="outline"
        className={cn(exportBtn)}
        onClick={() => handleExport("PDF")}
      >
        <FileText className="size-4 text-[#DC2626]" aria-hidden />
        PDF
      </Button>
      <Button
        type="button"
        variant="outline"
        className={cn(exportBtn)}
        onClick={() => handleExport("Print")}
      >
        <Printer className="size-4 text-[#16A34A]" aria-hidden />
        Print
      </Button>
    </div>
  );
}
