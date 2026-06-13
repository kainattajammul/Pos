export type BranchStatus = "active" | "inactive" | "archived";

export type BranchType =
  | "retail"
  | "repair_center"
  | "warehouse"
  | "franchise"
  | "kiosk";

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

export interface BranchOnlineSettings {
  websiteVisible: boolean;
  marketplaceVisible: boolean;
  clickAndCollect: boolean;
  publishedProducts: number;
  seoTitle: string;
}

export interface BranchCommunicationSettings {
  emailSender: string;
  smsSender: string;
  receiptHeader: string;
  receiptFooter: string;
  notificationsEnabled: boolean;
  documentTemplate: string;
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
  id: number;
  shopId: number;
  code: string;
  name: string;
  type: BranchType;
  status: BranchStatus;
  address: BranchAddress;
  contact: BranchContact;
  openingHours: BranchOpeningHours;
  holidays: BranchHoliday[];
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
  retail: "Retail Store",
  repair_center: "Repair Center",
  warehouse: "Warehouse",
  franchise: "Franchise",
  kiosk: "Kiosk",
};

export const BRANCH_STATUS_LABELS: Record<BranchStatus, string> = {
  active: "Active",
  inactive: "Inactive",
  archived: "Archived",
};
