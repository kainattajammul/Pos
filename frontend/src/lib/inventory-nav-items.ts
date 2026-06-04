export interface InventoryMegaMenuItem {
  id: string;
  label: string;
  href: string;
  quickCreateHref?: string;
}

export interface InventoryExpandableSection {
  id: string;
  label: string;
  href?: string;
  children: InventoryMegaMenuItem[];
}

/** Nested items under Manage Inventory */
export const MANAGE_INVENTORY_CHILDREN: InventoryMegaMenuItem[] = [
  {
    id: "products",
    label: "Products",
    href: "/inventory/products",
    quickCreateHref: "/inventory/products/new",
  },
  {
    id: "trade-in",
    label: "Trade In",
    href: "/inventory/trade-in",
    quickCreateHref: "/inventory/trade-in/new",
  },
  {
    id: "miscellaneous",
    label: "Miscellaneous",
    href: "/inventory/miscellaneous",
    quickCreateHref: "/inventory/miscellaneous/new",
  },
  {
    id: "bill-payments",
    label: "Bill Payments",
    href: "/inventory/bill-payments",
    quickCreateHref: "/inventory/bill-payments/new",
  },
  {
    id: "special-ordered",
    label: "Special Ordered Items",
    href: "/inventory/special-ordered",
  },
];

export const MANAGE_SERVICES_CHILDREN: InventoryMegaMenuItem[] = [
  { id: "service-list", label: "Service list", href: "/inventory/services" },
  { id: "service-categories", label: "Categories", href: "/inventory/services/categories" },
];

export const INVENTORY_LEFT_SECTIONS: InventoryExpandableSection[] = [
  {
    id: "manage-inventory",
    label: "Manage Inventory",
    href: "/inventory",
    children: MANAGE_INVENTORY_CHILDREN,
  },
  {
    id: "manage-services",
    label: "Manage Services",
    href: "/inventory/services",
    children: MANAGE_SERVICES_CHILDREN,
  },
];

export const INVENTORY_LEFT_LINKS: InventoryMegaMenuItem[] = [
  {
    id: "manage-bundles",
    label: "Manage Bundles",
    href: "/inventory/bundles",
    quickCreateHref: "/inventory/bundles/new",
  },
  { id: "transfer", label: "Transfer Inventory", href: "/inventory/transfer" },
];

/** Shown in left column when dropdown first opens (balanced 6+6) */
export const COLLAPSED_LEFT_ITEMS: InventoryMegaMenuItem[] = [
  { id: "count", label: "Inventory Count", href: "/inventory/count" },
  { id: "refurbishment", label: "Manage Refurbishment", href: "/inventory/refurbishment" },
];

/** Items that move from column 1 → column 2 when Manage Inventory expands */
export const MANAGE_INVENTORY_OVERFLOW_ITEMS: InventoryMegaMenuItem[] = [
  { id: "count", label: "Inventory Count", href: "/inventory/count" },
  { id: "refurbishment", label: "Manage Refurbishment", href: "/inventory/refurbishment" },
];

export const INVENTORY_RIGHT_MENU: InventoryMegaMenuItem[] = [
  { id: "gift-cards", label: "Manage Gift Cards", href: "/inventory/gift-cards" },
  {
    id: "purchase-orders",
    label: "Purchase Orders",
    href: "/purchases",
    quickCreateHref: "/purchases/new",
  },
  { id: "goods-received", label: "Goods Received Note", href: "/inventory/goods-received" },
  { id: "rma", label: "RMA", href: "/inventory/rma" },
  { id: "low-stock", label: "Low Stock Report", href: "/inventory/low-stock" },
  { id: "summary", label: "Inventory Summary", href: "/inventory" },
];

export function isInventoryMenuItemActive(pathname: string, href: string): boolean {
  if (pathname === href) return true;
  if (href === "/inventory") {
    return pathname === "/inventory";
  }
  if (href === "/inventory/products") {
    return (
      pathname === "/inventory/products" ||
      pathname.startsWith("/inventory/products/")
    );
  }
  if (href === "/inventory/count") {
    return (
      pathname === "/inventory/count" ||
      pathname.startsWith("/inventory/count/")
    );
  }
  if (href === "/inventory/refurbishment") {
    return (
      pathname === "/inventory/refurbishment" ||
      pathname.startsWith("/inventory/refurbishment/")
    );
  }
  if (href === "/purchases") {
    return pathname === "/purchases" || pathname.startsWith("/purchases/");
  }
  if (href.length > 1 && pathname.startsWith(`${href}/`)) return true;
  return false;
}

export function isSectionActive(pathname: string, section: InventoryExpandableSection): boolean {
  if (section.href && isInventoryMenuItemActive(pathname, section.href)) return true;
  return section.children.some((child) => isInventoryMenuItemActive(pathname, child.href));
}

export function isAnyInventoryPage(pathname: string): boolean {
  return (
    pathname === "/inventory" ||
    pathname.startsWith("/inventory/") ||
    pathname === "/purchases" ||
    pathname.startsWith("/purchases/")
  );
}

export type InventoryMenuRow =
  | { kind: "section"; section: InventoryExpandableSection }
  | { kind: "link"; item: InventoryMegaMenuItem };

export interface InventoryMenuLayout {
  left: InventoryMenuRow[];
  right: InventoryMenuRow[];
  /** Visual row count for left column (includes expanded submenu rows) */
  leftRowCount: number;
  /** Visual row count for right column */
  rightRowCount: number;
}

/** Count rendered rows in a column (expanded section adds child rows). */
export function countColumnRows(
  rows: InventoryMenuRow[],
  expandedSectionId: string | null,
): number {
  let count = 0;
  for (const row of rows) {
    if (row.kind === "section") {
      count += 1;
      if (expandedSectionId === row.section.id) {
        count += row.section.children.length;
      }
    } else {
      count += 1;
    }
  }
  return count;
}

/** Balanced layout: 6 items per column, no submenu visible */
export function getCollapsedMenuLayout(expandedSectionId: string | null): InventoryMenuLayout {
  const left: InventoryMenuRow[] = [
    { kind: "section", section: INVENTORY_LEFT_SECTIONS[0] },
    { kind: "section", section: INVENTORY_LEFT_SECTIONS[1] },
    ...INVENTORY_LEFT_LINKS.map((item) => ({ kind: "link" as const, item })),
    ...COLLAPSED_LEFT_ITEMS.map((item) => ({ kind: "link" as const, item })),
  ];
  const right: InventoryMenuRow[] = INVENTORY_RIGHT_MENU.map((item) => ({
    kind: "link" as const,
    item,
  }));
  const leftRowCount = countColumnRows(left, expandedSectionId);
  const rightRowCount = countColumnRows(right, expandedSectionId);
  const balanced = Math.max(leftRowCount, rightRowCount);
  return { left, right, leftRowCount: balanced, rightRowCount: balanced };
}

/** Manage Inventory expanded: overflow items shift to column 2 */
export function getManageInventoryExpandedLayout(
  expandedSectionId: string | null,
): InventoryMenuLayout {
  const left: InventoryMenuRow[] = [
    { kind: "section", section: INVENTORY_LEFT_SECTIONS[0] },
    { kind: "section", section: INVENTORY_LEFT_SECTIONS[1] },
    ...INVENTORY_LEFT_LINKS.map((item) => ({ kind: "link" as const, item })),
  ];
  const right: InventoryMenuRow[] = [
    ...MANAGE_INVENTORY_OVERFLOW_ITEMS.map((item) => ({ kind: "link" as const, item })),
    ...INVENTORY_RIGHT_MENU.map((item) => ({ kind: "link" as const, item })),
  ];
  return {
    left,
    right,
    leftRowCount: countColumnRows(left, expandedSectionId),
    rightRowCount: countColumnRows(right, expandedSectionId),
  };
}

export function getManageServicesExpandedLayout(
  expandedSectionId: string | null,
): InventoryMenuLayout {
  const left: InventoryMenuRow[] = [
    { kind: "section", section: INVENTORY_LEFT_SECTIONS[0] },
    { kind: "section", section: INVENTORY_LEFT_SECTIONS[1] },
    ...INVENTORY_LEFT_LINKS.map((item) => ({ kind: "link" as const, item })),
  ];
  const right: InventoryMenuRow[] = [
    ...COLLAPSED_LEFT_ITEMS.map((item) => ({ kind: "link" as const, item })),
    ...INVENTORY_RIGHT_MENU.map((item) => ({ kind: "link" as const, item })),
  ];
  return {
    left,
    right,
    leftRowCount: countColumnRows(left, expandedSectionId),
    rightRowCount: countColumnRows(right, expandedSectionId),
  };
}

export function getMenuLayout(expandedSectionId: string | null): InventoryMenuLayout {
  if (expandedSectionId === "manage-inventory") {
    return getManageInventoryExpandedLayout(expandedSectionId);
  }
  if (expandedSectionId === "manage-services") {
    return getManageServicesExpandedLayout(expandedSectionId);
  }
  return getCollapsedMenuLayout(expandedSectionId);
}
