import type { NavChild } from "@/constants/navigation";

/** All inventory links shown in the sidebar under Manage Inventory */
export const MANAGE_INVENTORY_CHILDREN: NavChild[] = [
  { title: "Products", href: "/inventory/products" },
  { title: "Trade In", href: "/inventory/trade-in" },
  { title: "Miscellaneous", href: "/inventory/miscellaneous" },
  { title: "Bill Payments", href: "/inventory/bill-payments" },
  { title: "Special Ordered Items", href: "/inventory/special-ordered" },
  {
    title: "Manage Services",
    children: [
      { title: "Service list", href: "/inventory/services" },
      { title: "Categories", href: "/inventory/services/categories" },
    ],
  },
  { title: "Manage Bundles", href: "/inventory/bundles" },
  { title: "Transfer Inventory", href: "/inventory/transfer" },
  { title: "Inventory Count", href: "/inventory/count" },
  { title: "Manage Refurbishment", href: "/inventory/refurbishment" },
  { title: "Manage Gift Cards", href: "/inventory/gift-cards" },
  { title: "Purchase Orders", href: "/purchases" },
  { title: "Goods Received Note", href: "/inventory/goods-received" },
  { title: "RMA", href: "/inventory/rma" },
  { title: "Low Stock Report", href: "/inventory/low-stock" },
  { title: "Inventory Summary", href: "/inventory" },
];
