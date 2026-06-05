import type { TicketRow } from "@/components/repairs/manage-tickets/ticket-table";
import type { TicketDetail } from "@/components/repairs/manage-tickets/ticket-view-types";

export const MOCK_TICKETS: TicketRow[] = [
  {
    id: "T-5",
    device: "iPhone 15 Pro Max",
    location: "Fone doctors",
    service: ["Screen (Digitizer + LCD) Replacement"],
    customer: "Walkin Customer",
    taskType: "In-Store",
    assignedTo: "Faisal Sheikh",
    dueAt: "July 25, 2025 at 1:49 PM",
    createdAt: "July 25, 2025 at 1:49 PM",
    last: "July at 1",
    highlighted: false,
  },
  {
    id: "T-4",
    device: "iPhone 15",
    location: "---",
    service: ["Back Camera Replacement", "Battery Replacement"],
    ticketItems: "front camera",
    customer: "Walkin Customer",
    taskType: "In-Store",
    assignedTo: "Faisal She",
    dueAt: "July 24, 2025 at 6:29 PM",
    createdAt: "July 24, 2025 at 5:32 PM",
    last: "July at 1",
    highlighted: true,
  },
  {
    id: "T-2",
    device: "iPhone 15 Pro Max",
    location: "---",
    service: ["Back Camera Replacement"],
    customer: "Walkin Customer",
    taskType: "On-Site",
    assignedTo: "Faisal She",
    dueAt: "July 24, 2025 at 2:30 PM",
    createdAt: "July 24, 2025 at 1:17 PM",
    last: "July at 1",
    highlighted: true,
  },
  {
    id: "T-1",
    device: "iPhone 15",
    location: "---",
    service: ["Back Camera Replacement"],
    ticketItems: "front camera",
    customer: "Walkin Customer",
    taskType: "In-Store",
    assignedTo: "Faisal She",
    dueAt: "July 24, 2025 at 1:04 PM",
    createdAt: "July 24, 2025 at 12:01 PM",
    last: "July at 1",
    highlighted: true,
  },
  {
    id: "T-3",
    device: "",
    location: "",
    service: [],
    customer: "Walkin Customer",
    createdAt: "July 24, 2025 at 2:43 PM",
    draft: true,
  },
];

const DETAIL_OVERRIDES: Record<string, Partial<TicketDetail>> = {
  "T-5": {
    status: "In Progress",
    price: 31,
    categoryPath: "Computer/Laptop Repair -> Apple",
    serialImei: "---",
    warranty: "90 Days",
    pinPattern: "---",
    network: "",
    physicalLocation: "",
    assetIssues: ["Screen (Digitizer + LCD) Replacement"],
    billing: {
      items: [
        {
          label: "iPhone 15 Pro Max - Screen (Digitizer + LCD) Replacement",
          price: 31,
        },
      ],
      total: 31,
      paid: 0,
      due: 31,
      estimatedProfit: 29,
    },
    estimate: {
      id: "002",
      date: "Jul 25, 2025 at 1:48 PM",
      status: "Converted",
    },
    ticketSummary: {
      createdAt: "Jul 25, 2025 1:49 pm",
      lastModified: "Jul 25, 2025 at 1:50 PM",
      location: "Fone doctors",
      generatedBy: "Faisal Sheikh",
      source: "Web App",
    },
  },
};

function defaultDetailFromRow(row: TicketRow): TicketDetail {
  const serviceLabel = row.service.join(", ") || "Repair Service";
  const price = row.service.length > 1 ? 55 : 31;

  return {
    row,
    status: row.draft ? "Draft" : "In Progress",
    price,
    categoryPath: "Mobile Repair -> Apple",
    serialImei: "---",
    warranty: "90 Days",
    pinPattern: "---",
    network: "",
    physicalLocation: "",
    assetIssues: row.service.length > 0 ? [...row.service] : [],
    attachedParts: row.ticketItems ? [row.ticketItems] : [],
    inventoryItems: [],
    diagnosticNotes: "",
    additionalNote: "",
    additionalDetails: "",
    suppliedItems: [],
    billing: {
      items: [{ label: `${row.device || "Device"} - ${serviceLabel}`, price }],
      total: price,
      paid: 0,
      due: price,
      estimatedProfit: Math.max(0, price - 2),
    },
    estimate: row.draft
      ? undefined
      : { id: "001", date: row.createdAt, status: "Pending" },
    ticketSummary: {
      createdAt: row.createdAt,
      lastModified: row.dueAt ?? row.createdAt,
      location: row.location || "Repair Store",
      generatedBy: row.assignedTo ?? "Staff",
      source: "Web App",
    },
    conditions: [
      "Select All",
      "Powers On",
      "Wifi",
      "Boots",
      "Bluetooth",
      "Keyboard",
      "TrackPad",
      "Battery",
      "USB ports",
      "Drivers",
      "Fan",
      "Blue Screen",
    ],
    systemMessages: [],
  };
}

export function getMockTicketById(id: string): TicketRow | undefined {
  return MOCK_TICKETS.find((t) => t.id === id);
}

export function getTicketDetail(id: string): TicketDetail | null {
  const row = getMockTicketById(id);
  if (!row) return null;

  const base = defaultDetailFromRow(row);
  const override = DETAIL_OVERRIDES[id];
  if (!override) return base;

  return {
    ...base,
    ...override,
    row,
    billing: override.billing ?? base.billing,
    ticketSummary: override.ticketSummary ?? base.ticketSummary,
    assetIssues: override.assetIssues ?? base.assetIssues,
  };
}
