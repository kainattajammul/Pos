export interface ManageServicesTab {
  id: string;
  label: string;
  href: string;
}

export const MANAGE_SERVICES_TABS: ManageServicesTab[] = [
  { id: "repairs", label: "Repairs", href: "/inventory/repairs" },
  { id: "unlocking", label: "Unlocking", href: "/inventory/services/unlocking" },
];

export function getManageServicesTabId(pathname: string): string | null {
  const match = MANAGE_SERVICES_TABS.find(
    (tab) => pathname === tab.href || pathname.startsWith(`${tab.href}/`),
  );
  return match?.id ?? null;
}
