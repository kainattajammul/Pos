import type {
  BranchCommunicationSettings,
  BranchDeviceSettings,
  BranchFinanceSettings,
  BranchInventorySettings,
  BranchOnlineSettings,
  BranchOperationsSettings,
  BranchReportingSettings,
  BranchStaffSettings,
  BranchSystemSettings,
} from "@/lib/branch-types";
import { clearedWebsiteServices } from "@/lib/branch-website-services";
import { defaultInvoiceSettings, sampleMessageTemplates } from "@/lib/branch-communication-defaults";

export const DEFAULT_INVENTORY: BranchInventorySettings = {
  allocationMode: "dedicated",
  stockLevel: 0,
  lowStockThreshold: 25,
  reorderRules: "",
  transferApprovalRequired: true,
  valuationMethod: "weighted_average",
};

export const DEFAULT_OPERATIONS: BranchOperationsSettings = {
  salesToday: 0,
  openRepairTickets: 0,
  appointmentSlotsPerDay: 16,
  pickupEnabled: true,
  deliveryRadiusKm: 10,
  warrantyClaimsOpen: 0,
};

export const DEFAULT_STAFF: BranchStaffSettings = {
  assignedStaffCount: 0,
  rolesEnabled: [],
  rotaEnabled: false,
  securityRules: "",
};

export const DEFAULT_FINANCE: BranchFinanceSettings = {
  registerId: "",
  cashDrawerAssigned: false,
  paymentsToday: 0,
  refundsToday: 0,
  openInvoices: 0,
  vatRate: "20%",
  currency: "GBP",
  timezone: "Europe/London",
  endOfDayRequired: true,
};

export const DEFAULT_ONLINE: BranchOnlineSettings = {
  websiteVisible: false,
  marketplaceVisible: false,
  clickAndCollect: false,
  publishedProducts: 0,
  seoTitle: "",
  ...clearedWebsiteServices(),
};

export const DEFAULT_COMMUNICATION: BranchCommunicationSettings = {
  emailSender: "",
  smsSender: "",
  receiptHeader: "",
  receiptFooter: "",
  notificationsEnabled: true,
  documentTemplate: "",
  invoice: defaultInvoiceSettings(),
  messageTemplates: sampleMessageTemplates(),
};

export const DEFAULT_REPORTING: BranchReportingSettings = {
  salesTargetMonthly: 0,
  repairTargetMonthly: 0,
  commissionRules: "",
  lastReportGenerated: "—",
};

export const DEFAULT_DEVICES: BranchDeviceSettings = {
  storageLocations: 0,
  repairShelves: 0,
  pickupAreas: 0,
  devicesInStorage: 0,
  handoverPending: 0,
};

export const DEFAULT_SYSTEM: BranchSystemSettings = {
  dataSyncStatus: "synced",
  lastSyncAt: new Date().toISOString(),
  franchiseOwner: "",
  auditLogCount: 0,
  twoFactorRequired: false,
};

export function createModuleDefaults() {
  return {
    staff: { ...DEFAULT_STAFF },
    inventory: { ...DEFAULT_INVENTORY },
    operations: { ...DEFAULT_OPERATIONS },
    finance: { ...DEFAULT_FINANCE },
    online: { ...DEFAULT_ONLINE },
    communication: { ...DEFAULT_COMMUNICATION },
    reporting: { ...DEFAULT_REPORTING },
    devices: { ...DEFAULT_DEVICES },
    system: { ...DEFAULT_SYSTEM },
  };
}
