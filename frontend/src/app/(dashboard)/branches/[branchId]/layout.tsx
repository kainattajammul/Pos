import { BranchDetailLayoutShell } from "@/components/branches/branch-layout-shell";

interface BranchDetailLayoutProps {
  children: React.ReactNode;
  params: Promise<{ branchId: string }>;
}

export default async function BranchDetailLayout({
  children,
  params,
}: BranchDetailLayoutProps) {
  const { branchId } = await params;

  return (
    <BranchDetailLayoutShell branchUuid={branchId}>
      {children}
    </BranchDetailLayoutShell>
  );
}
