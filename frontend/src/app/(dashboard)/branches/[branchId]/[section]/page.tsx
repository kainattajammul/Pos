import type { Metadata } from "next";
import { BranchSectionPage } from "@/components/branches/branch-section-page";
import { getBranchNavItem } from "@/lib/branch-nav-items";

interface BranchSectionRouteProps {
  params: Promise<{ branchId: string; section: string }>;
}

export async function generateMetadata({ params }: BranchSectionRouteProps): Promise<Metadata> {
  const { section } = await params;
  const navItem = getBranchNavItem(section);
  return {
    title: navItem ? `${navItem.label} | Branch` : "Branch",
  };
}

export default async function BranchSectionRoutePage({ params }: BranchSectionRouteProps) {
  const { branchId, section } = await params;
  return <BranchSectionPage branchUuid={branchId} sectionSlug={section} />;
}
