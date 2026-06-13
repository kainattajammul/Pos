import type { Metadata } from "next";
import { BranchListLayoutShell } from "@/components/branches/branch-layout-shell";
import { BranchesListPage } from "@/components/branches/branches-list-page";

export const metadata: Metadata = {
  title: "Branch Management | Admin",
  description: "Manage store branches, staff, inventory, and operations",
};

export default function BranchesPage() {
  return (
    <BranchListLayoutShell>
      <BranchesListPage />
    </BranchListLayoutShell>
  );
}
