export interface ProfileField {
  label: string;
  value: string;
}

export interface ProfileCommissionSummary {
  totalCommission: string | null;
  pendingCommission: string | null;
  paidCommission: string | null;
  salesCount: string | null;
  repairJobsHandled: string | null;
}

export interface ProfileShiftSummary {
  currentShiftStatus: string | null;
  clockInTime: string | null;
  clockOutTime: string | null;
  startShiftStatus: string | null;
  cashInOutStatus: string | null;
  storeAssigned: string | null;
}

export interface UserProfileViewModel {
  id: string;
  fullName: string;
  username: string | null;
  email: string;
  phone: string | null;
  role: string;
  roleLabel: string;
  storeBranch: string | null;
  employeeId: string;
  accountStatus: string;
  createdDate: string | null;
  lastLogin: string | null;
  assignedLocation: string | null;
  accessLevel: string | null;
  avatarInitials: string;
  shift: ProfileShiftSummary;
  commission: ProfileCommissionSummary;
  loginEnabled: boolean;
  twoFactorEnabled: boolean | null;
  canEdit: boolean;
}
