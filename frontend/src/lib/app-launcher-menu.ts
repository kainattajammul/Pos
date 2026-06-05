import type { LucideIcon } from "lucide-react";
import {
  Clock,
  Inbox,
  Lightbulb,
  LogIn,
  Percent,
  Plug,
  Receipt,
  Send,
  Settings,
  ScrollText,
  User,
  Wallet,
} from "lucide-react";

export interface AppLauncherMenuItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
}

export const APP_LAUNCHER_COLUMNS: AppLauncherMenuItem[][] = [
  [
    { id: "my-profile", label: "My Profile", href: "/settings", icon: User },
    { id: "start-shift", label: "Start Shift", href: "/shift/start", icon: LogIn },
    {
      id: "my-commission",
      label: "My Commission",
      href: "/reports/my-commission",
      icon: Percent,
    },
    { id: "integrations", label: "Integrations", href: "/settings/integrations", icon: Plug },
  ],
  [
    {
      id: "store-settings",
      label: "Store Settings",
      href: "/settings/store/general",
      icon: Settings,
    },
    {
      id: "transaction-log",
      label: "Transaction Log",
      href: "/reports/transaction-log",
      icon: ScrollText,
    },
    { id: "inbox", label: "Inbox", href: "/inbox", icon: Inbox },
    { id: "knowledge-base", label: "Knowledge Base", href: "/knowledge-base", icon: Lightbulb },
  ],
  [
    { id: "clock-in-out", label: "Clock In / Out", href: "/clock", icon: Clock },
    { id: "cash-in-out", label: "Cash In / Out", href: "/reports/cash-in-out", icon: Wallet },
    { id: "outbox", label: "Outbox", href: "/outbox", icon: Send },
    { id: "billing", label: "Billing", href: "/settings/billing", icon: Receipt },
  ],
];
