import type { BranchStatus } from "@/lib/branch-types";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<BranchStatus, string> = {
  active: "bg-[#DCFCE7] text-[#166534] border-[#BBF7D0]",
  inactive: "bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]",
  archived: "bg-[#F3F4F6] text-[#4B5563] border-[#E5E7EB]",
};

export function BranchStatusBadge({
  status,
  className,
}: {
  status: BranchStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize",
        STATUS_STYLES[status],
        className,
      )}
    >
      {status}
    </span>
  );
}
