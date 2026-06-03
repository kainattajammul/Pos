export type LeadDateTab = "Today" | "30 days" | "7 days" | "12 month";

export type LeadStatus =
  | "Won"
  | "Lost"
  | "Open"
  | "In progress"
  | "Expired"
  | "Canceled";

export type ReferralSource =
  | "Face Book"
  | "Bing"
  | "Search Bing"
  | "Google Ads"
  | "Others";

export interface LeadRecord {
  id: string;
  reference: string;
  createdDate: string;
  customer: string;
  organization: string;
  invoiceStatus: string;
  paid: number;
  due: number;
  total: number;
  status: LeadStatus;
  referralSource: ReferralSource;
}

export interface LeadStats {
  won: number;
  lost: number;
  openLeads: number;
  inProgress: number;
  expired: number;
  canceled: number;
  referralCounts: Record<ReferralSource, number>;
  totalValueAllLeads: number;
  leadsWonValue: number;
}

export interface WalkInCustomerFormState {
  customerType: string;
  firstName: string;
  lastName: string;
  phoneType: string;
  phone: string;
  email: string;
  drivingLicense: string;
  taxClass: string;
  emailAlerts: string;
  address: string;
  customerSearch: string;
}

export const DEFAULT_WALK_IN_CUSTOMER: WalkInCustomerFormState = {
  customerType: "Individual",
  firstName: "",
  lastName: "",
  phoneType: "Mobile",
  phone: "",
  email: "",
  drivingLicense: "",
  taxClass: "",
  emailAlerts: "",
  address: "",
  customerSearch: "",
};
