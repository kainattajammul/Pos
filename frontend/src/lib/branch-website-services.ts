import type {
  BranchOnlineSettings,
  BuyStyleWebsiteSubcategories,
  RepairWebsiteSubcategories,
  SellDeviceWebsiteSubcategories,
  WebsiteServiceCategoryKey,
} from "@/lib/branch-types";

export function clearSubcategories<T extends Record<string, boolean>>(subs: T): T {
  return Object.fromEntries(Object.keys(subs).map((key) => [key, false])) as T;
}

export function isCategoryEnabled(subcategories: Record<string, boolean>): boolean {
  return Object.values(subcategories).some(Boolean);
}

export function countSelectedSubcategories(subcategories: Record<string, boolean>): number {
  return Object.values(subcategories).filter(Boolean).length;
}

export function getSelectedSubcategoryLabels(
  subcategories: readonly { key: string; label: string }[],
  values: Record<string, boolean>,
): string[] {
  return subcategories.filter((subcategory) => values[subcategory.key]).map((subcategory) => subcategory.label);
}

export function countConfiguredWebsiteCategories(
  online: Pick<BranchOnlineSettings, WebsiteServiceCategoryKey>,
): number {
  return WEBSITE_SERVICE_CATEGORIES.filter((category) =>
    isCategoryEnabled({ ...online[category.key] }),
  ).length;
}

export function defaultRepairSubcategories(): RepairWebsiteSubcategories {
  return {
    storeRepair: false,
    postalRepair: false,
    collectMyDevice: false,
    fixAtMyAddress: false,
  };
}

export function defaultSellDeviceSubcategories(): SellDeviceWebsiteSubcategories {
  return {
    sellInStore: false,
    postYourDevice: false,
    collectMyDevice: false,
  };
}

export function defaultBuyStyleSubcategories(): BuyStyleWebsiteSubcategories {
  return {
    buyInStore: false,
    postMyDevice: false,
  };
}

export const WEBSITE_SERVICE_CATEGORIES = [
  {
    key: "repair" as const,
    label: "Repair",
    subcategories: [
      { key: "storeRepair" as const, label: "Store Repair" },
      { key: "postalRepair" as const, label: "Postal Repair" },
      { key: "collectMyDevice" as const, label: "Collect my Device" },
      { key: "fixAtMyAddress" as const, label: "Fix at my address" },
    ],
  },
  {
    key: "sellDevice" as const,
    label: "Sell a device",
    subcategories: [
      { key: "sellInStore" as const, label: "Sell In Store" },
      { key: "postYourDevice" as const, label: "Post your Device" },
      { key: "collectMyDevice" as const, label: "Collect my device" },
    ],
  },
  {
    key: "buyDevice" as const,
    label: "Buy a device",
    subcategories: [
      { key: "buyInStore" as const, label: "Buy in store" },
      { key: "postMyDevice" as const, label: "Post my device" },
    ],
  },
  {
    key: "buyAccessories" as const,
    label: "Buy accessories",
    subcategories: [
      { key: "buyInStore" as const, label: "Buy in store" },
      { key: "postMyDevice" as const, label: "Post my device" },
    ],
  },
  {
    key: "unlocking" as const,
    label: "Unlocking",
    subcategories: [
      { key: "buyInStore" as const, label: "Buy in store" },
      { key: "postMyDevice" as const, label: "Post my device" },
    ],
  },
  {
    key: "eSim" as const,
    label: "E-sim/Third party devices",
    subcategories: [
      { key: "buyInStore" as const, label: "Buy in store" },
      { key: "postMyDevice" as const, label: "Post my device" },
    ],
  },
] as const;

type LegacyWebsiteServiceFlags = {
  repairEnabled?: boolean;
  sellDeviceEnabled?: boolean;
  buyDeviceEnabled?: boolean;
  buyAccessoriesEnabled?: boolean;
  unlockingEnabled?: boolean;
  eSimEnabled?: boolean;
};

export function clearedWebsiteServices(): Pick<BranchOnlineSettings, WebsiteServiceCategoryKey> {
  return {
    repair: defaultRepairSubcategories(),
    sellDevice: defaultSellDeviceSubcategories(),
    buyDevice: defaultBuyStyleSubcategories(),
    buyAccessories: defaultBuyStyleSubcategories(),
    unlocking: defaultBuyStyleSubcategories(),
    eSim: defaultBuyStyleSubcategories(),
  };
}

function applyLegacyCategoryFlag<T>(
  subs: T,
  enabled: boolean | undefined,
  primaryKey: keyof T,
): T {
  if (!enabled) return subs;
  return { ...subs, [primaryKey]: true };
}

export function normalizeWebsiteServices(
  online?: Partial<BranchOnlineSettings> & LegacyWebsiteServiceFlags,
): Pick<BranchOnlineSettings, WebsiteServiceCategoryKey> {
  const cleared = clearedWebsiteServices();
  const legacy = online as LegacyWebsiteServiceFlags | undefined;

  if (online?.repair && typeof online.repair === "object") {
    cleared.repair = { ...cleared.repair, ...online.repair };
  } else {
    cleared.repair = applyLegacyCategoryFlag(cleared.repair, legacy?.repairEnabled, "storeRepair");
  }

  if (online?.sellDevice && typeof online.sellDevice === "object") {
    cleared.sellDevice = { ...cleared.sellDevice, ...online.sellDevice };
  } else {
    cleared.sellDevice = applyLegacyCategoryFlag(
      cleared.sellDevice,
      legacy?.sellDeviceEnabled,
      "sellInStore",
    );
  }

  const buyStyleKeys = ["buyDevice", "buyAccessories", "unlocking", "eSim"] as const;
  const legacyBuyKeys = {
    buyDevice: legacy?.buyDeviceEnabled,
    buyAccessories: legacy?.buyAccessoriesEnabled,
    unlocking: legacy?.unlockingEnabled,
    eSim: legacy?.eSimEnabled,
  } as const;

  for (const key of buyStyleKeys) {
    const existing = online?.[key];
    if (existing && typeof existing === "object") {
      cleared[key] = { ...cleared[key], ...existing };
    } else {
      cleared[key] = applyLegacyCategoryFlag(cleared[key], legacyBuyKeys[key], "buyInStore");
    }
  }

  return cleared;
}
