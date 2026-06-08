export interface UnlockingService {
  id: string;
  itemId: number;
  name: string;
  supportedDevices: string;
  price: number;
  cost: number;
}

export interface UnlockingServiceFilters {
  itemId: string;
  name: string;
}

export const DEFAULT_UNLOCKING_FILTERS: UnlockingServiceFilters = {
  itemId: "",
  name: "",
};

export function filterUnlockingServices(
  rows: UnlockingService[],
  filters: UnlockingServiceFilters,
): UnlockingService[] {
  const itemIdQuery = filters.itemId.trim();
  const nameQuery = filters.name.trim().toLowerCase();

  return rows.filter((row) => {
    if (itemIdQuery && !String(row.itemId).includes(itemIdQuery)) return false;
    if (nameQuery && !row.name.toLowerCase().includes(nameQuery)) return false;
    return true;
  });
}

export function formatUnlockingMoney(value: number): string {
  return value.toFixed(2);
}
