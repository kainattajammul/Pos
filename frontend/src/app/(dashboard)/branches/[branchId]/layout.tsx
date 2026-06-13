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
  const id = Number(branchId);

  return (
    <BranchDetailLayoutShell branchId={id}>
      {children}
    </BranchDetailLayoutShell>
  );
}
