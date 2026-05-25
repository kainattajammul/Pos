import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Boxes,
  Contact,
  LayoutDashboard,
  Package,
  Receipt,
  Settings,
  ShoppingBag,
  ShoppingCart,
  UserCircle,
  Users,
  Wrench,
} from "lucide-react";

export interface NavChild {
  title: string;
  href: string;
}

export interface NavItem {
  title: string;
  href?: string;
  icon: LucideIcon;
  children?: NavChild[];
}

export const MAIN_NAV: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  {
    title: "User Management",
    icon: Users,
    children: [
      { title: "Users", href: "/users" },
      { title: "Roles", href: "/roles" },
    ],
  },
  {
    title: "Repair Management System",
    icon: Wrench,
    children: [{ title: "Repairs", href: "/repairs" }],
  },
  {
    title: "Customer",
    icon: UserCircle,
    children: [{ title: "Customers", href: "/customer" }],
  },
  {
    title: "Contacts",
    icon: Contact,
    children: [
      { title: "Customers", href: "/customers" },
      { title: "Suppliers", href: "/suppliers" },
    ],
  },
  {
    title: "Products",
    icon: Package,
    children: [
      { title: "Category", href: "/products/categories" },
      { title: "Subcategory", href: "/products/subcategories" },
      { title: "Products", href: "/products" },
    ],
  },
  {
    title: "Sell",
    icon: ShoppingCart,
    children: [{ title: "Sales", href: "/sales" }],
  },
  {
    title: "Purchase",
    icon: ShoppingBag,
    children: [{ title: "Purchases", href: "/purchases" }],
  },
  { title: "Reports", href: "/reports", icon: BarChart3 },
  {
    title: "Stock",
    icon: Boxes,
    children: [
      { title: "Inventory", href: "/inventory" },
      { title: "Repairs", href: "/repairs" },
    ],
  },
  { title: "Expenses", href: "/expenses", icon: Receipt },
  { title: "Settings", href: "/settings", icon: Settings },
];

export const BRAND = {
  name: "Repair Access",
  tagline: "The Tech Specialist",
} as const;
