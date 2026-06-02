export const MISC_SERVICE_TYPE_OPTIONS = [
  "Software Issue",
  "Data Transfer",
  "Data Recovery",
  "Diagnostic Check",
  "Cleaning Service",
  "Speaker / Microphone Issue",
  "Camera Issue",
  "Button Issue",
  "Water Damage Check",
  "Other Service",
] as const;

export const MISC_URGENCY_OPTIONS = ["Normal", "Urgent", "Same Day Required"] as const;

export const MISC_CONTACT_METHOD_OPTIONS = [
  "Phone Call",
  "WhatsApp",
  "Email",
] as const;

export type MiscServiceType = (typeof MISC_SERVICE_TYPE_OPTIONS)[number];
export type MiscUrgency = (typeof MISC_URGENCY_OPTIONS)[number];
export type MiscContactMethod = (typeof MISC_CONTACT_METHOD_OPTIONS)[number];

export interface MiscRequestFormValues {
  deviceBrand: string;
  deviceModel: string;
  serviceType: MiscServiceType | "";
  issueDescription: string;
  urgency: MiscUrgency | "";
  deviceImageName: string;
  damageImageName: string;
  customerName: string;
  phoneNumber: string;
  emailAddress: string;
  preferredContact: MiscContactMethod | "";
}

export const MISC_FORM_DEFAULTS: MiscRequestFormValues = {
  deviceBrand: "",
  deviceModel: "",
  serviceType: "",
  issueDescription: "",
  urgency: "",
  deviceImageName: "",
  damageImageName: "",
  customerName: "",
  phoneNumber: "",
  emailAddress: "",
  preferredContact: "",
};
