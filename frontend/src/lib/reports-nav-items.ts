import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Box,
  PieChart,
  Users,
} from "lucide-react";

export interface ReportNavItem {
  id: string;
  label: string;
  href: string;
}

export interface ReportNavSection {
  id: string;
  title?: string;
  icon?: LucideIcon;
  items: ReportNavItem[];
}

export const REPORT_NAV_SECTIONS: ReportNavSection[] = [
  {
    id: "sales-reports",
    title: "Sales Reports",
    icon: BarChart3,
    items: [
      { id: "store-dashboard", label: "Store Dashboard", href: "/reports/store-dashboard" },
      { id: "sales-summary", label: "Sales Summary Report", href: "/reports/sales-summary" },
      { id: "transaction-log", label: "Transaction Log", href: "/reports/transaction-log" },
      {
        id: "how-did-you-hear",
        label: "How Did You Hear About Us",
        href: "/reports/how-did-you-hear",
      },
      { id: "tax-report", label: "Tax Report", href: "/reports/tax" },
      {
        id: "total-revenue-by-sales",
        label: "Total Revenue By Sales",
        href: "/reports/total-revenue-by-sales",
      },
      {
        id: "item-wise-sales",
        label: "Item-Wise Sales Report",
        href: "/reports/item-wise-sales",
      },
      { id: "z-report", label: "Z-Report", href: "/reports/z-report" },
    ],
  },
  {
    id: "register-reports",
    items: [
      { id: "register-dashboard", label: "Dashboard", href: "/reports/register-dashboard" },
      { id: "register-sales", label: "Register Sales", href: "/reports/register-sales" },
      {
        id: "sales-by-item-type",
        label: "Sales By Item Type",
        href: "/reports/sales-by-item-type",
      },
      { id: "cash-in-out", label: "Cash In/Out Report", href: "/reports/cash-in-out" },
      { id: "trade-in-report", label: "Trade In Report", href: "/inventory/trade-in" },
      {
        id: "payment-type-totals",
        label: "Total Amount By Payment Type",
        href: "/reports/payment-type-totals",
      },
      { id: "profit-loss", label: "Profit & Loss Report", href: "/reports/profit-loss" },
    ],
  },
  {
    id: "employee-reports",
    title: "Employee Reports",
    icon: Users,
    items: [
      {
        id: "employee-activity",
        label: "Employee Activity Log",
        href: "/reports/employee-activity",
      },
      {
        id: "employee-productivity",
        label: "Employee Productivity",
        href: "/reports/employee-productivity",
      },
      { id: "employee-payroll", label: "Employee Payroll", href: "/reports/employee-payroll" },
      {
        id: "payroll-payments",
        label: "Payroll Payments Report",
        href: "/reports/payroll-payments",
      },
      { id: "my-commission", label: "My Commission", href: "/reports/my-commission" },
      { id: "export-log", label: "Export Log", href: "/reports/export-log" },
      {
        id: "commission-breakdown",
        label: "Employee Commission Breakdown",
        href: "/reports/commission-breakdown",
      },
    ],
  },
  {
    id: "inventory-reports",
    title: "Inventory Reports",
    icon: Box,
    items: [
      { id: "inventory-summary", label: "Inventory Summary", href: "/inventory" },
      {
        id: "inventory-adjustment",
        label: "Inventory Adjustment",
        href: "/reports/inventory-adjustment",
      },
      {
        id: "part-consumption",
        label: "Part Consumption Report",
        href: "/reports/part-consumption",
      },
      { id: "low-stock", label: "Low Stock Report", href: "/inventory/low-stock" },
      { id: "damaged-part", label: "Damaged Part Report", href: "/reports/damaged-part" },
      { id: "ticket-items", label: "Ticket Items Report", href: "/reports/ticket-items" },
    ],
  },
  {
    id: "expense-reports",
    title: "Expense Reports",
    icon: PieChart,
    items: [{ id: "expense-report", label: "Expense Report", href: "/reports/expense" }],
  },
];

export const ALL_REPORT_ITEMS: ReportNavItem[] = REPORT_NAV_SECTIONS.flatMap(
  (section) => section.items,
);

export function isAnyReportsPage(pathname: string): boolean {
  if (pathname === "/reports" || pathname.startsWith("/reports/")) return true;
  return ALL_REPORT_ITEMS.some(
    (item) =>
      item.href !== "/reports" &&
      !item.href.startsWith("/reports/") &&
      (pathname === item.href || pathname.startsWith(`${item.href}/`)),
  );
}

export function findReportItemByHref(href: string): ReportNavItem | undefined {
  return ALL_REPORT_ITEMS.find((item) => item.href === href);
}
