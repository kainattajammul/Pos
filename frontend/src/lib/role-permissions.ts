export interface PermissionItem {
  key: string;
  label: string;
}

export interface PermissionGroup {
  id: string;
  name: string;
  permissions: PermissionItem[];
}

export const ROLE_PERMISSION_GROUPS: PermissionGroup[] = [
  {
    id: "user",
    name: "User",
    permissions: [
      { key: "user.view", label: "View user" },
      { key: "user.add", label: "Add user" },
      { key: "user.edit", label: "Edit user" },
      { key: "user.delete", label: "Delete user" },
    ],
  },
  {
    id: "roles",
    name: "Roles",
    permissions: [
      { key: "roles.view", label: "View role" },
      { key: "roles.add", label: "Add Role" },
      { key: "roles.edit", label: "Edit Role" },
      { key: "roles.delete", label: "Delete role" },
    ],
  },
  {
    id: "supplier",
    name: "Supplier",
    permissions: [
      { key: "supplier.view_all", label: "View all supplier" },
      { key: "supplier.view_own", label: "View own supplier" },
      { key: "supplier.add", label: "Add supplier" },
      { key: "supplier.edit", label: "Edit supplier" },
      { key: "supplier.delete", label: "Delete supplier" },
    ],
  },
  {
    id: "customer",
    name: "Customer",
    permissions: [
      { key: "customer.view_all", label: "View all customer" },
      { key: "customer.view_own", label: "View own customer" },
      { key: "customer.add", label: "Add customer" },
      { key: "customer.edit", label: "Edit customer" },
      { key: "customer.delete", label: "Delete customer" },
    ],
  },
  {
    id: "product",
    name: "Product",
    permissions: [
      { key: "product.view", label: "View product" },
      { key: "product.add", label: "Add product" },
      { key: "product.edit", label: "Edit product" },
      { key: "product.delete", label: "Delete product" },
      { key: "product.opening_stock", label: "Add Opening Stock" },
      { key: "product.view_purchase_price", label: "View Purchase Price" },
    ],
  },
  {
    id: "purchase",
    name: "Purchase & Stock Adjustment",
    permissions: [
      { key: "purchase.view", label: "View purchase & Stock Adjustment" },
      { key: "purchase.add", label: "Add purchase & Stock Adjustment" },
      { key: "purchase.edit", label: "Edit purchase & Stock Adjustment" },
      { key: "purchase.delete", label: "Delete purchase & Stock Adjustment" },
      { key: "purchase.payments", label: "Add/Edit/Delete Payments" },
      { key: "purchase.update_status", label: "Update Status" },
      { key: "purchase.view_own", label: "View own purchase only" },
    ],
  },
  {
    id: "pos",
    name: "POS",
    permissions: [
      { key: "pos.view", label: "View POS sell" },
      { key: "pos.add", label: "Add POS sell" },
      { key: "pos.edit", label: "Edit POS sell" },
      { key: "pos.delete", label: "Delete POS sell" },
      { key: "pos.edit_price", label: "Edit product price from POS screen" },
      { key: "pos.edit_discount", label: "Edit product discount from POS screen" },
      { key: "pos.print_invoice", label: "Print Invoice" },
    ],
  },
  {
    id: "sell",
    name: "Sell",
    permissions: [
      { key: "sell.access", label: "Access sell" },
      { key: "sell.delete", label: "Delete Sell" },
      { key: "sell.list_drafts", label: "List Drafts" },
      { key: "sell.list_quotations", label: "List quotations" },
      { key: "sell.view_own", label: "View own sell only" },
      { key: "sell.agent_view_own", label: "Commission agent can view their own sell" },
      { key: "sell.payments", label: "Add/Edit/Delete Payments" },
      { key: "sell.edit_price", label: "Edit product price from Sales screen" },
      { key: "sell.edit_discount", label: "Edit product discount from Sale screen" },
      { key: "sell.discount", label: "Add/Edit/Delete Discount" },
      { key: "sell.service_types", label: "Access types of service" },
      { key: "sell.return", label: "Access sell return" },
      { key: "sell.invoice_number", label: "Add/edit invoice number" },
    ],
  },
  {
    id: "shipments",
    name: "Shipments",
    permissions: [
      { key: "shipments.access", label: "Access Shipments" },
      { key: "shipments.access_own", label: "Access own shipments" },
      { key: "shipments.agent_own", label: "Commission agent can access their own shipments" },
    ],
  },
  {
    id: "cash_register",
    name: "Cash Register",
    permissions: [
      { key: "cash_register.view", label: "View cash register" },
      { key: "cash_register.close", label: "Close cash register" },
    ],
  },
  {
    id: "brand",
    name: "Brand",
    permissions: [
      { key: "brand.view", label: "View brand" },
      { key: "brand.add", label: "Add brand" },
      { key: "brand.edit", label: "Edit brand" },
      { key: "brand.delete", label: "Delete brand" },
    ],
  },
  {
    id: "tax_rate",
    name: "Tax Rate",
    permissions: [
      { key: "tax_rate.view", label: "View tax rate" },
      { key: "tax_rate.add", label: "Add tax rate" },
      { key: "tax_rate.edit", label: "Edit tax rate" },
      { key: "tax_rate.delete", label: "Delete tax rate" },
    ],
  },
  {
    id: "unit",
    name: "Unit",
    permissions: [
      { key: "unit.view", label: "View unit" },
      { key: "unit.add", label: "Add unit" },
      { key: "unit.edit", label: "Edit unit" },
      { key: "unit.delete", label: "Delete unit" },
    ],
  },
  {
    id: "category",
    name: "Category",
    permissions: [
      { key: "category.view", label: "View category" },
      { key: "category.add", label: "Add category" },
      { key: "category.edit", label: "Edit category" },
      { key: "category.delete", label: "Delete category" },
    ],
  },
  {
    id: "report",
    name: "Report",
    permissions: [
      { key: "report.purchase_sell", label: "View purchase & sell report" },
      { key: "report.tax", label: "View Tax report" },
      { key: "report.supplier_customer", label: "View Supplier & Customer report" },
      { key: "report.profit_loss", label: "View profit/loss report" },
      { key: "report.stock", label: "View stock report, stock adjustment report & stock expiry report" },
      { key: "report.trending", label: "View trending product report" },
      { key: "report.register", label: "View register report" },
      { key: "report.sales_rep", label: "View sales representative report" },
      { key: "report.stock_value", label: "View product stock value" },
    ],
  },
  {
    id: "settings",
    name: "Settings",
    permissions: [
      { key: "settings.business", label: "Access business settings" },
      { key: "settings.barcode", label: "Access barcode settings" },
      { key: "settings.invoice", label: "Access invoice settings" },
      { key: "settings.printers", label: "Access printers" },
    ],
  },
  {
    id: "home",
    name: "Home",
    permissions: [{ key: "home.view", label: "View Home data" }],
  },
  {
    id: "account",
    name: "Account",
    permissions: [{ key: "account.access", label: "Access Accounts" }],
  },
  {
    id: "selling_price",
    name: "Access selling price groups",
    permissions: [{ key: "selling_price.default", label: "Default Selling Price" }],
  },
];

export const ALL_PERMISSION_KEYS = ROLE_PERMISSION_GROUPS.flatMap((g) =>
  g.permissions.map((p) => p.key),
);

export function createEmptyPermissionState(): Record<string, boolean> {
  return Object.fromEntries(ALL_PERMISSION_KEYS.map((key) => [key, false]));
}

export function isGroupFullySelected(
  group: PermissionGroup,
  selected: Record<string, boolean>,
): boolean {
  return group.permissions.every((p) => selected[p.key]);
}

export function setGroupPermissions(
  group: PermissionGroup,
  checked: boolean,
  current: Record<string, boolean>,
): Record<string, boolean> {
  const next = { ...current };
  for (const p of group.permissions) {
    next[p.key] = checked;
  }
  return next;
}
