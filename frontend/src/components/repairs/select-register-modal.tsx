"use client";

import { Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { APP_CONFIG } from "@/constants/config";
import {
  usePosRegisters,
  useStartPosRegisterShift,
} from "@/hooks/use-pos-registers";
import type { PosRegister } from "@/services/pos-registers.service";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface SelectRegisterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRegisterSelected?: (register: PosRegister) => void;
}

export function SelectRegisterModal({
  open,
  onOpenChange,
  onRegisterSelected,
}: SelectRegisterModalProps) {
  const shopId = APP_CONFIG.defaultShopId;
  const { data: registers = [], isLoading } = usePosRegisters(shopId);
  const startShift = useStartPosRegisterShift(shopId);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return registers;
    return registers.filter((r) => r.name.toLowerCase().includes(q));
  }, [query, registers]);

  const handleContinue = async (register: PosRegister) => {
    if (register.status === "CLOSED") {
      await startShift.mutateAsync(register.id);
      toast.success(`Shift started for ${register.name}`);
    }
    onRegisterSelected?.(register);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-black/45"
        className="!max-w-[min(900px,calc(100vw-2rem))] gap-0 overflow-hidden rounded-sm border border-[#D1D5DB] bg-white p-0 shadow-2xl ring-0"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-3">
          <DialogTitle className="text-lg font-semibold text-[#111827]">
            Select Register
          </DialogTitle>
          <DialogClose
            render={
              <button
                type="button"
                className="rounded p-1 text-[#6B7280] transition-colors hover:bg-[#F3F4F6]"
                aria-label="Close"
              />
            }
          >
            <X className="size-5" />
          </DialogClose>
        </div>

        {/* Table */}
        <div className="p-4">
          <div className="overflow-x-auto rounded-sm border border-[#E5E7EB]">
            {/* Header row */}
            <div className="grid grid-cols-[1fr_120px_140px] border-b border-[#E5E7EB] bg-[#FAFAFA] sm:grid-cols-[1fr_140px_160px]">
              <div className="flex items-center gap-3 border-r border-[#E5E7EB] px-4 py-2.5">
                <span className="shrink-0 text-sm font-semibold text-[#374151]">Register</span>
                <div className="relative min-w-0 flex-1">
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search Register"
                    className="h-9 w-full rounded-sm border border-[#7BC9CB] bg-white px-3 pr-9 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:border-(--repair-primary) focus:outline-none focus:ring-1 focus:ring-(--repair-primary)"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <Search className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-[#9CA3AF]" />
                </div>
              </div>
              <div className="flex items-center border-r border-[#E5E7EB] px-4 py-2.5 text-sm font-semibold text-[#374151]">
                Status
              </div>
              <div className="flex items-center px-4 py-2.5 text-sm font-semibold text-[#374151]">
                Action
              </div>
            </div>

            {/* Body rows */}
            {isLoading ? (
              <div className="px-4 py-6 text-center text-sm text-[#6B7280]">
                Loading registers...
              </div>
            ) : filtered.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-[#6B7280]">
                No register found
              </div>
            ) : (
              filtered.map((register) => (
                <div
                  key={register.id}
                  className="grid cursor-pointer grid-cols-[1fr_120px_140px] border-b border-[#E5E7EB] last:border-b-0 hover:bg-[#F9FAFB] sm:grid-cols-[1fr_140px_160px]"
                  onClick={() => void handleContinue(register)}
                >
                  <div className="flex items-center border-r border-[#E5E7EB] px-4 py-3 text-sm font-bold uppercase tracking-wide text-[#1F2937]">
                    {register.name}
                  </div>
                  <div className="flex items-center border-r border-[#E5E7EB] px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex items-center justify-center rounded-sm px-3 py-1 text-xs font-bold text-white",
                        register.status === "OPEN" ? "bg-[#22C55E]" : "bg-[#6B7280]",
                      )}
                    >
                      {register.status}
                    </span>
                  </div>
                  <div className="flex items-center px-4 py-3">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        void handleContinue(register);
                      }}
                      className="rounded-sm border border-[#D1D5DB] bg-[#EEF4F7] px-4 py-1.5 text-sm font-medium text-[#0D9488] transition-colors hover:bg-[#E2ECEF]"
                    >
                      Start Shift
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
