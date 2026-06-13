import { redirect } from "next/navigation";

interface BranchDetailIndexProps {
  params: Promise<{ branchId: string }>;
}

export default async function BranchDetailIndexPage({ params }: BranchDetailIndexProps) {
  const { branchId } = await params;
  redirect(`/branches/${branchId}/setup`);
}
