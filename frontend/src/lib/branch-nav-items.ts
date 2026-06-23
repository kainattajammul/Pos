import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Building2,
  CreditCard,
  Globe,
  HardDrive,
  Mail,
  Package,
  Shield,
  Users,
  Wrench,
} from "lucide-react";

export interface BranchNavItem {
  id: string;
  slug: string;
  label: string;
  shortLabel: string;
  description: string;
  icon: LucideIcon;
}

export const BRANCH_NAV_ITEMS: BranchNavItem[] = [
  {
    id: "setup",
    slug: "setup",
    label: "Branch Setup & Profile",
    shortLabel: "Setup",
    description: "Profile, address, hours, holidays, and status",
    icon: Building2,
  },
  {
    id: "staff",
    slug: "staff",
    label: "Branch Staff & Permissions",
    shortLabel: "Staff",
    description: "Staff assignment, roles, rota, and security",
    icon: Users,
  },
  {
    id: "inventory",
    slug: "inventory",
    label: "Branch Inventory & Stock",
    shortLabel: "Inventory",
    description: "Allocation, stock levels, transfers, and valuation",
    icon: Package,
  },
  {
    id: "operations",
    slug: "operations",
    label: "Branch Sales, Repairs & Operations",
    shortLabel: "Operations",
    description: "Sales, repairs, appointments, pickup, and warranty",
    icon: Wrench,
  },
  {
    id: "finance",
    slug: "finance",
    label: "Branch Payments, Register & Finance",
    shortLabel: "Finance",
    description: "Register, payments, invoices, tax, and closing",
    icon: CreditCard,
  },
  {
    id: "online",
    slug: "online",
    label: "Branch Website, Marketplace & Online Visibility",
    shortLabel: "Online",
    description: "Website, marketplace, click & collect, publishing, and website services",
    icon: Globe,
  },
  {
    id: "communication",
    slug: "communication",
    label: "Branch Communication & Documents",
    shortLabel: "Communication",
    description: "Notifications, receipts, email/SMS, templates",
    icon: Mail,
  },
  {
    id: "reporting",
    slug: "reporting",
    label: "Branch Reporting & Analytics",
    shortLabel: "Reporting",
    description: "Reports, targets, commission, and performance",
    icon: BarChart3,
  },
  {
    id: "devices",
    slug: "devices",
    label: "Branch Device & Storage Management",
    shortLabel: "Devices",
    description: "Storage, shelves, pickup areas, and handover",
    icon: HardDrive,
  },
  {
    id: "system",
    slug: "system",
    label: "Branch System & Audit",
    shortLabel: "System",
    description: "Sync status, audit logs, security, franchise",
    icon: Shield,
  },
];

export function getBranchNavItem(slug: string): BranchNavItem | undefined {
  return BRANCH_NAV_ITEMS.find((item) => item.slug === slug);
}

export function isBranchSectionPath(pathname: string): boolean {
  return BRANCH_NAV_ITEMS.some((item) => pathname.includes(`/branches/`) && pathname.endsWith(`/${item.slug}`));
}

export function filterBranchNavItems(items: BranchNavItem[], query: string): BranchNavItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items.filter(
    (item) =>
      item.label.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q),
  );
}
