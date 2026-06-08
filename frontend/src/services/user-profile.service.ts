import { loadUserProfileExtras } from "@/lib/user-form-storage";
import { fetchCurrentUser } from "@/services/auth.service";
import { fetchUser } from "@/services/users.service";
import type { AuthUser } from "@/types/api";
import type { UserProfileViewModel } from "@/types/user-profile";
import type { UserTableRow } from "@/types/user-table";

function formatRoleLabel(role: string): string {
  return role
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDate(value: string | null | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function initialsFromName(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function buildProfileViewModel(
  authUser: AuthUser,
  apiUser: UserTableRow | null,
  extras: ReturnType<typeof loadUserProfileExtras>,
): UserProfileViewModel {
  const userId = Number(authUser.id);
  const fullName = apiUser?.fullName ?? authUser.name ?? authUser.email.split("@")[0] ?? "User";
  const username =
    extras?.username?.trim() ||
    authUser.email.split("@")[0] ||
    null;
  const phone = apiUser?.phone ?? extras?.mobileNumber?.trim() || null;
  const roleLabel = formatRoleLabel(authUser.role);
  const isActive = extras?.isActive ?? true;
  const allowLogin = extras?.allowLogin ?? true;

  const assignedLocation =
    extras?.accessLocations?.trim() ||
    (extras?.allLocations ? "All locations" : null) ||
    (extras?.locationSuperadmin ? "Superadmin" : null) ||
    null;

  const storeBranch = assignedLocation || extras?.branch?.trim() || null;

  return {
    id: authUser.id,
    fullName,
    username,
    email: apiUser?.email ?? authUser.email,
    phone,
    role: authUser.role,
    roleLabel,
    storeBranch,
    employeeId: authUser.id,
    accountStatus: isActive ? "Active" : "Inactive",
    createdDate: formatDate(apiUser?.createdAt),
    lastLogin: null,
    assignedLocation,
    accessLevel: roleLabel,
    avatarInitials: initialsFromName(fullName),
    shift: {
      currentShiftStatus: null,
      clockInTime: null,
      clockOutTime: null,
      startShiftStatus: null,
      cashInOutStatus: null,
      storeAssigned: storeBranch,
    },
    commission: {
      totalCommission: null,
      pendingCommission: null,
      paidCommission: null,
      salesCount: null,
      repairJobsHandled: null,
    },
    loginEnabled: allowLogin,
    twoFactorEnabled: null,
    canEdit: Number.isFinite(userId) && userId > 0,
  };
}

export async function fetchMyProfile(authUser?: AuthUser | null): Promise<UserProfileViewModel> {
  const sessionUser = authUser ?? (await fetchCurrentUser());
  const userId = Number(sessionUser.id);

  let apiUser: UserTableRow | null = null;
  if (Number.isFinite(userId) && userId > 0) {
    try {
      apiUser = await fetchUser(userId);
    } catch {
      apiUser = null;
    }
  }

  const extras =
    Number.isFinite(userId) && userId > 0 ? loadUserProfileExtras(userId) : null;

  return buildProfileViewModel(sessionUser, apiUser, extras);
}
