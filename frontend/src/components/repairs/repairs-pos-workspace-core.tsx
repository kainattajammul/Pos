"use client";

import dynamic from "next/dynamic";
import type { RepairsPosWorkspaceCoreProps } from "@/components/repairs/repairs-pos-workspace-inner";

export type { RepairsPosWorkspaceCoreProps } from "@/components/repairs/repairs-pos-workspace-inner";

function WorkspaceInnerSkeleton() {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 items-center justify-center bg-white text-sm text-[#6B7280]">
      Loading workflow…
    </div>
  );
}

const RepairsPosWorkspaceInner = dynamic(
  () =>
    import("@/components/repairs/repairs-pos-workspace-inner").then(
      (m) => m.RepairsPosWorkspaceInner,
    ),
  { ssr: false, loading: () => <WorkspaceInnerSkeleton /> },
);

/** Thin entry — heavy logic lives in repairs-pos-workspace-inner (separate compile chunk). */
export function RepairsPosWorkspaceCore(props: RepairsPosWorkspaceCoreProps) {
  return <RepairsPosWorkspaceInner {...props} />;
}
