import { appendActivityLog, readStoredActivityLog } from "@/lib/activity-log-storage";
import type { ActivityLogEntry } from "@/lib/activity-log-types";
import type { AuthUser } from "@/types/api";

function daysAgo(days: number, hours = 10, minutes = 0): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hours, minutes, 0, 0);
  return date.toISOString();
}

function seedEntriesForUser(user: AuthUser): ActivityLogEntry[] {
  return [
    {
      id: `seed-login-${user.id}`,
      userId: user.id,
      userName: user.name,
      email: user.email,
      category: "AUTH",
      action: "Signed in",
      description: "User signed in to Repair Management System",
      ipAddress: "192.168.1.24",
      createdAt: daysAgo(0, 9, 12),
    },
    {
      id: `seed-shift-${user.id}`,
      userId: user.id,
      userName: user.name,
      email: user.email,
      category: "SHIFT",
      action: "Shift started",
      description: "Register shift opened for daily POS operations",
      reference: "Register 1",
      createdAt: daysAgo(0, 9, 18),
    },
    {
      id: `seed-sale-${user.id}`,
      userId: user.id,
      userName: user.name,
      email: user.email,
      category: "SALE",
      action: "Ticket payment",
      description: "Repair ticket payment processed",
      reference: "TKT-10482",
      createdAt: daysAgo(0, 11, 4),
    },
    {
      id: `seed-payment-${user.id}`,
      userId: user.id,
      userName: user.name,
      email: user.email,
      category: "PAYMENT",
      action: "Cash in recorded",
      description: "Opening cash amount added to register",
      reference: "REG-001",
      createdAt: daysAgo(1, 9, 5),
    },
    {
      id: `seed-profile-${user.id}`,
      userId: user.id,
      userName: user.name,
      email: user.email,
      category: "PROFILE",
      action: "Profile viewed",
      description: "User opened My Profile page",
      createdAt: daysAgo(2, 14, 22),
    },
  ];
}

const OTHER_USER_ENTRIES: ActivityLogEntry[] = [
  {
    id: "seed-other-1",
    userId: "2",
    userName: "System Admin",
    email: "admin@repairshop.local",
    category: "SYSTEM",
    action: "Settings updated",
    description: "Store general settings saved",
    reference: "Store Settings",
    createdAt: daysAgo(0, 8, 30),
  },
  {
    id: "seed-other-2",
    userId: "3",
    userName: "Jane Cashier",
    email: "cashier@repairshop.local",
    category: "SALE",
    action: "Invoice created",
    description: "Walk-in customer invoice generated",
    reference: "INV-2201",
    createdAt: daysAgo(1, 16, 45),
  },
];

export interface FetchActivityLogParams {
  user: AuthUser;
  scope?: "mine" | "all";
}

export async function fetchActivityLog({
  user,
  scope = "all",
}: FetchActivityLogParams): Promise<ActivityLogEntry[]> {
  const stored = readStoredActivityLog();
  const seeded = [...seedEntriesForUser(user), ...OTHER_USER_ENTRIES];
  const merged = [...stored, ...seeded].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const unique = new Map<string, ActivityLogEntry>();
  for (const entry of merged) {
    unique.set(entry.id, entry);
  }

  let entries = Array.from(unique.values());

  if (scope === "mine") {
    entries = entries.filter(
      (entry) =>
        entry.userId === user.id ||
        entry.email.toLowerCase() === user.email.toLowerCase(),
    );
  }

  return entries;
}

export function logProfileUpdated(user: AuthUser, description: string) {
  return appendActivityLog({
    userId: user.id,
    userName: user.name,
    email: user.email,
    category: "PROFILE",
    action: "Profile updated",
    description,
  });
}

export function logPasswordChanged(user: AuthUser) {
  return appendActivityLog({
    userId: user.id,
    userName: user.name,
    email: user.email,
    category: "AUTH",
    action: "Password changed",
    description: "Account password was updated successfully",
  });
}

export function logProfileViewed(user: AuthUser) {
  return appendActivityLog({
    userId: user.id,
    userName: user.name,
    email: user.email,
    category: "PROFILE",
    action: "Profile viewed",
    description: "User opened My Profile page",
  });
}

export function logActivityLogViewed(user: AuthUser, scope: "mine" | "all") {
  return appendActivityLog({
    userId: user.id,
    userName: user.name,
    email: user.email,
    category: "SYSTEM",
    action: "Activity log viewed",
    description:
      scope === "mine"
        ? "User viewed personal activity log from My Profile"
        : "User opened transaction activity log",
  });
}
