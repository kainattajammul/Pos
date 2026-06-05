export interface ManageInventoryTab {
  id: string;
  label: string;
  href: string;
}

export const MANAGE_INVENTORY_TABS: ManageInventoryTab[] = [
  { id: "products", label: "Products", href: "/inventory/products" },
  { id: "trade-in", label: "Trade In", href: "/inventory/trade-in" },
  { id: "casual", label: "Casual", href: "/inventory/miscellaneous" },
  { id: "bill-payments", label: "Bill Payments", href: "/inventory/bill-payments" },
  {
    id: "special-ordered",
    label: "Special Ordered Items",
    href: "/inventory/special-ordered",
  },
];

export function getManageInventoryTabId(pathname: string): string | null {
  const match = MANAGE_INVENTORY_TABS.find(
    (tab) => pathname === tab.href || pathname.startsWith(`${tab.href}/`),
  );
  return match?.id ?? null;
}
