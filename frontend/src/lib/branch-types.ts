export type BranchStatus =
  | "draft"
  | "active"
  | "inactive"
  | "temporarily_closed"
  | "archived";

export type BranchType =
  | "main"
  | "standard"
  | "franchise"
  | "warehouse"
  | "kiosk"
  | "service_centre"
  | "online"
  | "other";

export interface BranchOpeningHours {
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
}

export interface BranchHoliday {
  id: string;
  label: string;
  date: string;
  closed: boolean;
}

export interface BranchContact {
  phone: string;
  email: string;
  managerName: string;
  emergencyContact: string;
}

export interface BranchAddress {
  line1: string;
  line2: string;
  city: string;
  county: string;
  postcode: string;
  country: string;
}

export interface BranchStaffSettings {
  assignedStaffCount: number;
  rolesEnabled: string[];
  rotaEnabled: boolean;
  securityRules: string;
}

export interface BranchInventorySettings {
  allocationMode: "shared" | "dedicated";
  stockLevel: number;
  lowStockThreshold: number;
  reorderRules: string;
  transferApprovalRequired: boolean;
  valuationMethod: string;
}

export interface BranchOperationsSettings {
  salesToday: number;
  openRepairTickets: number;
  appointmentSlotsPerDay: number;
  pickupEnabled: boolean;
  deliveryRadiusKm: number;
  warrantyClaimsOpen: number;
}

export interface BranchFinanceSettings {
  registerId: string;
  cashDrawerAssigned: boolean;
  paymentsToday: number;
  refundsToday: number;
  openInvoices: number;
  vatRate: string;
  currency: string;
  timezone: string;
  endOfDayRequired: boolean;
}

export interface RepairWebsiteSubcategories {
  storeRepair: boolean;
  postalRepair: boolean;
  collectMyDevice: boolean;
  fixAtMyAddress: boolean;
}

export interface SellDeviceWebsiteSubcategories {
  sellInStore: boolean;
  postYourDevice: boolean;
  collectMyDevice: boolean;
}

export interface BuyStyleWebsiteSubcategories {
  buyInStore: boolean;
  postMyDevice: boolean;
}

export type WebsiteServiceCategoryKey =
  | "repair"
  | "sellDevice"
  | "buyDevice"
  | "buyAccessories"
  | "unlocking"
  | "eSim";

export interface BranchOnlineSettings {
  websiteVisible: boolean;
  marketplaceVisible: boolean;
  clickAndCollect: boolean;
  publishedProducts: number;
  seoTitle: string;
  repair: RepairWebsiteSubcategories;
  sellDevice: SellDeviceWebsiteSubcategories;
  buyDevice: BuyStyleWebsiteSubcategories;
  buyAccessories: BuyStyleWebsiteSubcategories;
  unlocking: BuyStyleWebsiteSubcategories;
  eSim: BuyStyleWebsiteSubcategories;
}

export interface BranchCommunicationSettings {
  emailSender: string;
  smsSender: string;
  receiptHeader: string;
  receiptFooter: string;
  notificationsEnabled: boolean;
  documentTemplate: string;
  invoice: BranchInvoiceSettings;
  messageTemplates: BranchCustomerMessageTemplate[];
}

export interface BranchInvoiceSettings {
  invoicePrefix: string;
  nextInvoiceNumber: number;
  paymentTerms: string;
  dueDays: number;
  showVatBreakdown: boolean;
  footerTerms: string;
  defaultNotes: string;
  legalName: string;
  showBranchAddress: boolean;
}

export interface BranchCustomerMessageTemplate {
  id: string;
  name: string;
  channel: "email" | "sms" | "both";
  trigger: string;
  subject: string;
  body: string;
  enabled: boolean;
}

export interface BranchReportingSettings {
  salesTargetMonthly: number;
  repairTargetMonthly: number;
  commissionRules: string;
  lastReportGenerated: string;
}

export interface BranchDeviceSettings {
  storageLocations: number;
  repairShelves: number;
  pickupAreas: number;
  devicesInStorage: number;
  handoverPending: number;
}

export interface BranchSystemSettings {
  dataSyncStatus: "synced" | "pending" | "error";
  lastSyncAt: string;
  franchiseOwner: string;
  auditLogCount: number;
  twoFactorRequired: boolean;
}

export interface BranchRecord {
  uuid: string;
  shopId: number;
  code: string;
  name: string;
  type: BranchType;
  status: BranchStatus;
  address: BranchAddress;
  contact: BranchContact;
  openingHours: BranchOpeningHours;
  holidays: BranchHoliday[];
  timezone?: string;
  openingStatus?: {
    status: string;
    is_open: boolean;
    reason?: string;
  };
  staff: BranchStaffSettings;
  inventory: BranchInventorySettings;
  operations: BranchOperationsSettings;
  finance: BranchFinanceSettings;
  online: BranchOnlineSettings;
  communication: BranchCommunicationSettings;
  reporting: BranchReportingSettings;
  devices: BranchDeviceSettings;
  system: BranchSystemSettings;
  createdAt: string;
  updatedAt: string;
}

export interface BranchListFilters {
  search: string;
  status: BranchStatus | "all";
  type: BranchType | "all";
}

export interface CreateBranchPayload {
  shopId: number;
  code: string;
  name: string;
  type: BranchType;
  address: BranchAddress;
  contact: BranchContact;
}

export interface UpdateBranchPayload {
  name?: string;
  type?: BranchType;
  status?: BranchStatus;
  address?: Partial<BranchAddress>;
  contact?: Partial<BranchContact>;
  openingHours?: Partial<BranchOpeningHours>;
  holidays?: BranchHoliday[];
  staff?: Partial<BranchStaffSettings>;
  inventory?: Partial<BranchInventorySettings>;
  operations?: Partial<BranchOperationsSettings>;
  finance?: Partial<BranchFinanceSettings>;
  online?: Partial<BranchOnlineSettings>;
  communication?: Partial<BranchCommunicationSettings>;
  reporting?: Partial<BranchReportingSettings>;
  devices?: Partial<BranchDeviceSettings>;
  system?: Partial<BranchSystemSettings>;
}

export const BRANCH_TYPE_LABELS: Record<BranchType, string> = {
  main: "Main Branch",
  standard: "Standard",
  franchise: "Franchise",
  warehouse: "Warehouse",
  kiosk: "Kiosk",
  service_centre: "Service Centre",
  online: "Online",
  other: "Other",
};

export const BRANCH_STATUS_LABELS: Record<BranchStatus, string> = {
  draft: "Draft",
  active: "Active",
  inactive: "Inactive",
  temporarily_closed: "Temporarily Closed",
  archived: "Archived",
};
