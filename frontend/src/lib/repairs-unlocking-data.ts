export const UNLOCKING_TYPES = [
  "Network Unlock",
  "iCloud Unlock",
  "Google FRP Unlock",
  "SIM Unlock",
  "Other Unlocking",
] as const;

export type UnlockingType = (typeof UNLOCKING_TYPES)[number];

export interface UnlockingRequestFormValues {
  deviceBrand: string;
  deviceModel: string;
  networkCarrier: string;
  imei: string;
  unlockingType: UnlockingType | "";
  customerNote: string;
}

export const UNLOCKING_FORM_DEFAULTS: UnlockingRequestFormValues = {
  deviceBrand: "",
  deviceModel: "",
  networkCarrier: "",
  imei: "",
  unlockingType: "",
  customerNote: "",
};
