import type { LucideIcon } from "lucide-react";
import {
  BadgePercent,
  Bell,
  Building2,
  DollarSign,
  GitBranch,
  Gift,
  HandCoins,
  Link2,
  ListChecks,
  Repeat,
  ShoppingBag,
  Store,
  TicketPercent,
  Mail,
  Monitor,
  ReceiptText,
  User,
  Users,
  Wrench,
} from "lucide-react";

export interface SettingsNavChild {
  id: string;
  label: string;
  href: string;
}

export interface SettingsNavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href?: string;
  badge?: string;
  defaultExpanded?: boolean;
  children?: SettingsNavChild[];
}

export const SETTINGS_NAV_ITEMS: SettingsNavItem[] = [
  {
    id: "your-profile",
    label: "Your profile",
    icon: User,
    href: "/settings/profile",
  },
  {
    id: "branch-management",
    label: "Branch management",
    icon: GitBranch,
    defaultExpanded: true,
    children: [
      {
        id: "branch-overview",
        label: "All branches",
        href: "/branches",
      },
      {
        id: "branch-settings",
        label: "System settings",
        href: "/settings/branches",
      },
    ],
  },
  {
    id: "store-settings",
    label: "Store settings",
    icon: Building2,
    defaultExpanded: true,
    children: [
      {
        id: "general-settings",
        label: "General settings",
        href: "/settings/store/general",
      },
      {
        id: "manage-stores",
        label: "Manage stores",
        href: "/settings/store/manage",
      },
      {
        id: "store-types",
        label: "Store types",
        href: "/settings/store/types",
      },
    ],
  },
  {
    id: "hardware-settings",
    label: "Hardware settings",
    icon: Monitor,
    href: "/settings/hardware",
  },
  {
    id: "employees",
    label: "Employees",
    icon: Users,
    href: "/settings/employees",
  },
  {
    id: "integrations",
    label: "Integrations",
    icon: Link2,
    href: "/settings/integrations",
  },
  {
    id: "mail-in",
    label: "Mail-in",
    icon: Mail,
    href: "/settings/mail-in",
  },
  {
    id: "suggestive-sale-alerts",
    label: "Suggestive sale alerts",
    icon: DollarSign,
    href: "/settings/suggestive-sale-alerts",
    badge: "New",
  },
  {
    id: "module-configuration",
    label: "Module configuration",
    icon: Wrench,
    href: "/settings/module-configuration",
  },
  {
    id: "email-notifications",
    label: "Email & notifications",
    icon: Bell,
    href: "/settings/email-notifications",
  },
  {
    id: "loyalty",
    label: "Loyalty",
    icon: BadgePercent,
    href: "/settings/loyalty",
  },
  {
    id: "gift-cards",
    label: "Gift cards",
    icon: Gift,
    href: "/settings/gift-cards",
  },
  {
    id: "store-credits",
    label: "Store credits",
    icon: HandCoins,
    href: "/settings/store-credits",
  },
  {
    id: "vat-margin",
    label: "VAT margin",
    icon: TicketPercent,
    href: "/settings/vat-margin",
  },
  {
    id: "recurring-billing",
    label: "Recurring billing",
    icon: Repeat,
    href: "/settings/recurring-billing",
  },
  {
    id: "suppliers",
    label: "Suppliers",
    icon: Store,
    href: "/settings/suppliers",
  },
  {
    id: "orders-status",
    label: "Orders status",
    icon: ListChecks,
    href: "/settings/orders-status",
  },
  {
    id: "payment-methods",
    label: "Payment methods",
    icon: ReceiptText,
    href: "/settings/payment-methods",
  },
  {
    id: "billing",
    label: "Billing",
    icon: ShoppingBag,
    href: "/settings/billing",
  },
  {
    id: "tell-a-friend",
    label: "Tell a friend",
    icon: Users,
    href: "/settings/tell-a-friend",
  },
];

export function filterSettingsNavItems(
  items: SettingsNavItem[],
  query: string,
): SettingsNavItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;

  return items
    .map((item) => {
      const labelMatch = item.label.toLowerCase().includes(q);
      const children = item.children?.filter(
        (child) =>
          child.label.toLowerCase().includes(q) || item.label.toLowerCase().includes(q),
      );

      if (children?.length) {
        return { ...item, children, defaultExpanded: true };
      }
      if (labelMatch) return item;
      return null;
    })
    .filter((item): item is SettingsNavItem => item != null);
}

export function isSettingsNavItemActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
