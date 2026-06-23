import type {
  BranchHoliday,
  BranchOnlineSettings,
  BranchOpeningHours,
  BranchRecord,
  BranchStatus,
  BranchType,
  CreateBranchPayload,
  UpdateBranchPayload,
} from "@/lib/branch-types";
import { defaultInvoiceSettings } from "@/lib/branch-communication-defaults";
import {
  clearedWebsiteServices,
  normalizeWebsiteServices,
} from "@/lib/branch-website-services";
import type {
  ApiBranchListItem,
  ApiBranchProfile,
  ApiOpeningHour,
} from "@/types/branch-api";

const DAYS: (keyof BranchOpeningHours)[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const EMPTY_HOURS: BranchOpeningHours = {
  monday: "Closed",
  tuesday: "Closed",
  wednesday: "Closed",
  thursday: "Closed",
  friday: "Closed",
  saturday: "Closed",
  sunday: "Closed",
};

function emptyAddress() {
  return {
    line1: "",
    line2: "",
    city: "",
    county: "",
    postcode: "",
    country: "United Kingdom",
  };
}

function emptyContact() {
  return {
    phone: "",
    email: "",
    managerName: "",
    emergencyContact: "",
  };
}

export function mapApiStatus(status: string): BranchStatus {
  const normalized = status.toLowerCase() as BranchStatus;
  if (
    normalized === "draft" ||
    normalized === "active" ||
    normalized === "inactive" ||
    normalized === "temporarily_closed" ||
    normalized === "archived"
  ) {
    return normalized;
  }
  return "inactive";
}

export function mapApiBranchType(type: string): BranchType {
  const normalized = type.toLowerCase().replace(/-/g, "_") as BranchType;
  const allowed: BranchType[] = [
    "main",
    "standard",
    "franchise",
    "warehouse",
    "kiosk",
    "service_centre",
    "online",
    "other",
  ];
  return allowed.includes(normalized) ? normalized : "standard";
}

export function formatDayHours(row: ApiOpeningHour): string {
  if (row.is_closed || !row.opens_at || !row.closes_at) return "Closed";
  return `${row.opens_at}-${row.closes_at}`;
}

export function mapOpeningHoursFromApi(rows: ApiOpeningHour[] = []): BranchOpeningHours {
  const hours = { ...EMPTY_HOURS };
  for (const row of rows) {
    const day = row.day_of_week?.toLowerCase() as keyof BranchOpeningHours;
    if (day && day in hours) {
      hours[day] = formatDayHours(row);
    }
  }
  return hours;
}

export function parseDayHours(value: string): {
  is_closed: boolean;
  opens_at: string | null;
  closes_at: string | null;
} {
  const trimmed = value.trim().replace(/^["']|["']$/g, "");
  if (!trimmed || trimmed.toLowerCase() === "closed") {
    return { is_closed: true, opens_at: null, closes_at: null };
  }
  const [opens_at, closes_at] = trimmed.split(/[-–—]/).map((part) => part.trim());
  return {
    is_closed: false,
    opens_at: opens_at || null,
    closes_at: closes_at || null,
  };
}

export function mapOpeningHoursToApi(hours: BranchOpeningHours): ApiOpeningHour[] {
  return DAYS.map((day) => {
    const parsed = parseDayHours(hours[day]);
    return {
      day_of_week: day,
      ...parsed,
    };
  });
}

export function mapClosuresToHolidays(
  closures: ApiBranchProfile["upcoming_closures"] = [],
): BranchHoliday[] {
  return closures.map((c) => ({
    id: String(c.id),
    label: c.title,
    date: c.starts_at.slice(0, 10),
    closed: true,
  }));
}

export { clearedWebsiteServices } from "@/lib/branch-website-services";

export function defaultBranchOnlineSettings(): BranchOnlineSettings {
  return {
    websiteVisible: false,
    marketplaceVisible: false,
    clickAndCollect: false,
    publishedProducts: 0,
    seoTitle: "",
    ...clearedWebsiteServices(),
  };
}

export function withBranchOnlineDefaults(
  online?: Partial<BranchOnlineSettings>,
): BranchOnlineSettings {
  const services = normalizeWebsiteServices(online);
  const merged: BranchOnlineSettings = {
    ...defaultBranchOnlineSettings(),
    ...online,
    ...services,
  };
  if (!merged.websiteVisible) {
    return { ...merged, ...clearedWebsiteServices() };
  }
  return merged;
}

function emptyModuleSettings(): Pick<
  BranchRecord,
  | "staff"
  | "inventory"
  | "operations"
  | "finance"
  | "online"
  | "communication"
  | "reporting"
  | "devices"
  | "system"
> {
  return {
    staff: {
      assignedStaffCount: 0,
      rolesEnabled: [],
      rotaEnabled: false,
      securityRules: "",
    },
    inventory: {
      allocationMode: "dedicated",
      stockLevel: 0,
      lowStockThreshold: 0,
      reorderRules: "",
      transferApprovalRequired: false,
      valuationMethod: "",
    },
    operations: {
      salesToday: 0,
      openRepairTickets: 0,
      appointmentSlotsPerDay: 0,
      pickupEnabled: false,
      deliveryRadiusKm: 0,
      warrantyClaimsOpen: 0,
    },
    finance: {
      registerId: "",
      cashDrawerAssigned: false,
      paymentsToday: 0,
      refundsToday: 0,
      openInvoices: 0,
      vatRate: "",
      currency: "GBP",
      timezone: "Europe/London",
      endOfDayRequired: false,
    },
    online: defaultBranchOnlineSettings(),
    communication: {
      emailSender: "",
      smsSender: "",
      receiptHeader: "",
      receiptFooter: "",
      notificationsEnabled: false,
      documentTemplate: "",
      invoice: defaultInvoiceSettings(),
      messageTemplates: [],
    },
    reporting: {
      salesTargetMonthly: 0,
      repairTargetMonthly: 0,
      commissionRules: "",
      lastReportGenerated: "",
    },
    devices: {
      storageLocations: 0,
      repairShelves: 0,
      pickupAreas: 0,
      devicesInStorage: 0,
      handoverPending: 0,
    },
    system: {
      dataSyncStatus: "pending",
      lastSyncAt: "",
      franchiseOwner: "",
      auditLogCount: 0,
      twoFactorRequired: false,
    },
  };
}

function moduleDefaults(
  shopId: number,
  partial: {
    uuid: string;
    code: string;
    name: string;
    type: BranchType;
    address: BranchRecord["address"];
    contact: BranchRecord["contact"];
  },
): Omit<BranchRecord, "createdAt" | "updatedAt" | "status" | "openingHours" | "holidays"> {
  return {
    uuid: partial.uuid,
    shopId,
    code: partial.code,
    name: partial.name,
    type: partial.type,
    address: partial.address,
    contact: partial.contact,
    ...emptyModuleSettings(),
  };
}

export function mapListItemToBranchRecord(
  item: ApiBranchListItem,
  shopId: number,
): BranchRecord {
  const defaults = moduleDefaults(shopId, {
    uuid: item.uuid,
    code: item.branch_code,
    name: item.name,
    type: mapApiBranchType(item.branch_type),
    address: {
      line1: item.address_line_1 ?? "",
      line2: item.address_line_2 ?? "",
      city: item.city ?? "",
      county: item.county ?? "",
      postcode: item.postcode ?? "",
      country: item.country ?? "United Kingdom",
    },
    contact: {
      ...emptyContact(),
      phone: item.phone ?? "",
      email: item.email ?? "",
      managerName: item.contact_person_name ?? "",
    },
  });

  return {
    ...defaults,
    status: mapApiStatus(item.status),
    openingHours: { ...EMPTY_HOURS },
    holidays: [],
    openingStatus: item.opening_status,
    online: withBranchOnlineDefaults(defaults.online),
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  };
}

export function mapProfileToBranchRecord(
  profile: ApiBranchProfile,
  shopId: number,
): BranchRecord {
  const defaults = moduleDefaults(shopId, {
    uuid: profile.uuid,
    code: profile.branch_code,
    name: profile.name,
    type: mapApiBranchType(profile.branch_type),
    address: {
      line1: profile.address.line_1 ?? "",
      line2: profile.address.line_2 ?? "",
      city: profile.address.city ?? "",
      county: profile.address.county ?? "",
      postcode: profile.address.postcode ?? "",
      country: profile.address.country ?? "United Kingdom",
    },
    contact: {
      phone: profile.contact.phone ?? "",
      email: profile.contact.email ?? "",
      managerName: profile.contact.contact_person_name ?? "",
      emergencyContact: profile.contact.alternative_phone ?? profile.contact.contact_person_phone ?? "",
    },
  });

  return {
    ...defaults,
    status: mapApiStatus(profile.status),
    openingHours: mapOpeningHoursFromApi(profile.opening_hours),
    holidays: mapClosuresToHolidays(profile.upcoming_closures),
    openingStatus: profile.opening_status,
    timezone: profile.timezone,
    online: withBranchOnlineDefaults(defaults.online),
    communication: {
      ...defaults.communication,
      emailSender: defaults.contact.email,
      receiptHeader: defaults.name,
      invoice: {
        ...defaults.communication.invoice,
        legalName: defaults.name,
      },
    },
    createdAt: profile.created_at,
    updatedAt: profile.updated_at,
  };
}

export function mapCreatePayloadToApi(payload: CreateBranchPayload) {
  return {
    branch_code: payload.code || undefined,
    name: payload.name,
    branch_type: payload.type,
    address_line_1: payload.address.line1,
    address_line_2: payload.address.line2 || undefined,
    city: payload.address.city,
    county: payload.address.county || undefined,
    postcode: payload.address.postcode,
    country: payload.address.country,
    phone: payload.contact.phone || undefined,
    email: payload.contact.email || undefined,
    contact_person_name: payload.contact.managerName || undefined,
    alternative_phone: payload.contact.emergencyContact || undefined,
  };
}

export function mapUpdatePayloadToApi(payload: UpdateBranchPayload) {
  const body: Record<string, unknown> = {};

  if (payload.name !== undefined) body.name = payload.name;
  if (payload.type !== undefined) body.branch_type = payload.type;
  if (payload.address) {
    if (payload.address.line1 !== undefined) body.address_line_1 = payload.address.line1;
    if (payload.address.line2 !== undefined) body.address_line_2 = payload.address.line2;
    if (payload.address.city !== undefined) body.city = payload.address.city;
    if (payload.address.county !== undefined) body.county = payload.address.county;
    if (payload.address.postcode !== undefined) body.postcode = payload.address.postcode;
    if (payload.address.country !== undefined) body.country = payload.address.country;
  }
  if (payload.contact) {
    if (payload.contact.phone !== undefined) body.phone = payload.contact.phone;
    if (payload.contact.email !== undefined) body.email = payload.contact.email;
    if (payload.contact.managerName !== undefined) {
      body.contact_person_name = payload.contact.managerName;
    }
    if (payload.contact.emergencyContact !== undefined) {
      body.alternative_phone = payload.contact.emergencyContact;
    }
  }

  return body;
}

export function hasProfileFields(payload: UpdateBranchPayload): boolean {
  return (
    payload.name !== undefined ||
    payload.type !== undefined ||
    payload.address !== undefined ||
    payload.contact !== undefined
  );
}

export function hasOpeningHours(payload: UpdateBranchPayload): boolean {
  return payload.openingHours !== undefined;
}
