export interface StoreGeneralSettings {
  businessName: string;
  storeEmail: string;
  alternateName: string;
  phone: string;
  mobile: string;
  fax: string;
  website: string;
  address: string;
  city: string;
  postcode: string;
  state: string;
  country: string;
  timezone: string;
  timeFormat: "12 hour" | "24 hour";
  language: string;
  defaultCurrency: string;
  priceFormat: "Decimal" | "Fraction";
  decimalFormat: "2 Decimal Places" | "3 Decimal Places" | "4 Decimal Places";
  chargeSalesTax: "Yes" | "No";
  registrationNo: string;
  startTime: string;
  endTime: string;
  defaultAddress: string;
  apiKey: string;
  accountingMethod: "cash" | "accrual";
  verificationEmail: string;
  receiveAllRepairdeskEmails: "Yes" | "No";
  required2fa: "Yes" | "No";
  chargeRestockingFee: "Yes" | "No";
  chargeDepositOnRepairs: "Yes" | "No";
  depositValue: string;
  depositType: "Amount" | "Percentage";
  taxOnDeposit: "Yes" | "No";
  depositTaxClass: string;
  chargeDepositToggle: "Yes" | "No";
  lockScreenTimeout: "Never" | "1 min" | "5 min" | "10 min";
  logoDataUrl: string | null;
}

export const DEFAULT_STORE_GENERAL_SETTINGS: StoreGeneralSettings = {
  businessName: "Fone doctors",
  storeEmail: "sheikh@fonedoctors.com",
  alternateName: "",
  phone: "+44 7400 123456",
  mobile: "+44 7400 123456",
  fax: "",
  website: "",
  address: "",
  city: "",
  postcode: "",
  state: "",
  country: "United Kingdom",
  timezone: "GMT +05:00 Karachi time (Asia/Karachi)",
  timeFormat: "12 hour",
  language: "English",
  defaultCurrency: "Pound Sterling",
  priceFormat: "Decimal",
  decimalFormat: "2 Decimal Places",
  chargeSalesTax: "No",
  registrationNo: "",
  startTime: "9:00 am",
  endTime: "6:00 am",
  defaultAddress: "",
  apiKey: "2a37cc4f-a4c1-4dc1-bf39-34a121f66d9e",
  accountingMethod: "cash",
  verificationEmail: "sheikh@fonedoctors.com",
  receiveAllRepairdeskEmails: "No",
  required2fa: "No",
  chargeRestockingFee: "No",
  chargeDepositOnRepairs: "No",
  depositValue: "5",
  depositType: "Amount",
  taxOnDeposit: "Yes",
  depositTaxClass: "",
  chargeDepositToggle: "No",
  lockScreenTimeout: "Never",
  logoDataUrl: null,
};

export const STORE_DISPLAY_NAME = "Fone doctors";
