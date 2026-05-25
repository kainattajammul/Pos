export const WALKIN_CUSTOMER_NAME = "Walkin Customer";

export type NewCustomerTab = "contact" | "address" | "additional";

export interface NewCustomerFormValues {
  customerGroup: string;
  taxClass: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneType: string;
  phoneCountryCode: string;
  phone: string;
  hearAboutUs: string;
  emailAlert: boolean;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  additionalNotes: string;
  referralCode: string;
}

export const NEW_CUSTOMER_DEFAULTS: NewCustomerFormValues = {
  customerGroup: "Individual",
  taxClass: "",
  firstName: "",
  lastName: "",
  email: "",
  phoneType: "Mobile",
  phoneCountryCode: "+1",
  phone: "",
  hearAboutUs: "",
  emailAlert: true,
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  zip: "",
  country: "United States",
  additionalNotes: "",
  referralCode: "",
};

export const CUSTOMER_GROUP_OPTIONS = ["Individual", "Business", "VIP", "Wholesale"];

export const TAX_CLASS_OPTIONS = ["", "Taxable", "Non-Taxable", "Exempt"];

export const PHONE_TYPE_OPTIONS = ["Mobile", "Home", "Work", "Other"];

export const HEAR_ABOUT_US_OPTIONS = [
  "",
  "Google",
  "Social Media",
  "Friend / Referral",
  "Walk-in",
  "Repeat Customer",
  "Other",
];

export function formatCustomerDisplayName(
  firstName: string,
  lastName: string,
): string {
  const name = [firstName.trim(), lastName.trim()].filter(Boolean).join(" ");
  return name || WALKIN_CUSTOMER_NAME;
}

export function isWalkinCustomerName(name: string): boolean {
  return name.trim().toLowerCase() === WALKIN_CUSTOMER_NAME.toLowerCase();
}

export function getCustomerInitials(displayName: string): string {
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "W";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
}
