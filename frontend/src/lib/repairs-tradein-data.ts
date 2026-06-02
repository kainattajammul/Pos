export const TRADE_IN_STORAGE_OPTIONS = [
  "32GB",
  "64GB",
  "128GB",
  "256GB",
  "512GB",
  "1TB",
  "Other",
] as const;

export const TRADE_IN_CONDITION_OPTIONS = [
  "Like New",
  "Good",
  "Fair",
  "Damaged",
  "Not Working",
] as const;

export const TRADE_IN_NETWORK_STATUS_OPTIONS = [
  "Unlocked",
  "Locked to Network",
  "Not Sure",
] as const;

export const TRADE_IN_BATTERY_HEALTH_OPTIONS = [
  "90% or above",
  "80% - 89%",
  "Below 80%",
  "Not Sure",
] as const;

export const TRADE_IN_ACCESSORY_OPTIONS = [
  "Original Box",
  "Charger",
  "Cable",
  "Receipt",
  "None",
] as const;

export type TradeInStorageCapacity = (typeof TRADE_IN_STORAGE_OPTIONS)[number];
export type TradeInCondition = (typeof TRADE_IN_CONDITION_OPTIONS)[number];
export type TradeInNetworkStatus = (typeof TRADE_IN_NETWORK_STATUS_OPTIONS)[number];
export type TradeInBatteryHealth = (typeof TRADE_IN_BATTERY_HEALTH_OPTIONS)[number];
export type TradeInAccessory = (typeof TRADE_IN_ACCESSORY_OPTIONS)[number];

export interface TradeInRequestFormValues {
  deviceBrand: string;
  deviceModel: string;
  storageCapacity: TradeInStorageCapacity | "";
  condition: TradeInCondition | "";
  networkStatus: TradeInNetworkStatus | "";
  batteryHealth: TradeInBatteryHealth | "";
  accessoriesIncluded: TradeInAccessory[];
  imeiNumber: string;
  frontImageName: string;
  backImageName: string;
  damageImageName: string;
  customerName: string;
  phoneNumber: string;
  emailAddress: string;
  customerNote: string;
}

export const TRADE_IN_FORM_DEFAULTS: TradeInRequestFormValues = {
  deviceBrand: "",
  deviceModel: "",
  storageCapacity: "",
  condition: "",
  networkStatus: "",
  batteryHealth: "",
  accessoriesIncluded: [],
  imeiNumber: "",
  frontImageName: "",
  backImageName: "",
  damageImageName: "",
  customerName: "",
  phoneNumber: "",
  emailAddress: "",
  customerNote: "",
};
