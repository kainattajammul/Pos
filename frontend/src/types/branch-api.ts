export type ApiBranchType =
  | "main"
  | "standard"
  | "franchise"
  | "warehouse"
  | "kiosk"
  | "service_centre"
  | "online"
  | "other";

export type ApiBranchStatus =
  | "draft"
  | "active"
  | "inactive"
  | "temporarily_closed"
  | "archived";

export interface ApiOpeningStatus {
  status: string;
  is_open: boolean;
  reason?: string;
  current_local_time?: string;
  next_change_at?: string | null;
  next_change_type?: string | null;
}

export interface ApiOpeningHour {
  day_of_week: string;
  is_closed: boolean;
  opens_at: string | null;
  closes_at: string | null;
  break_starts_at?: string | null;
  break_ends_at?: string | null;
}

export interface ApiBranchClosure {
  id: number;
  title: string;
  reason: string | null;
  closure_type: string;
  starts_at: string;
  ends_at: string;
  all_day: boolean;
  is_recurring: boolean;
  recurrence_rule: string | null;
}

export interface ApiBranchListItem {
  uuid: string;
  branch_code: string;
  name: string;
  branch_type: ApiBranchType;
  city: string | null;
  phone: string | null;
  email: string | null;
  status: ApiBranchStatus;
  opening_status: ApiOpeningStatus;
  is_primary: boolean;
  is_active: boolean;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
  available_actions?: string[];
}

export interface ApiBranchProfile {
  uuid: string;
  branch_code: string;
  name: string;
  slug: string;
  branch_type: ApiBranchType;
  status: ApiBranchStatus;
  is_primary: boolean;
  is_active: boolean;
  archived_at: string | null;
  address: {
    line_1: string | null;
    line_2: string | null;
    city: string | null;
    county: string | null;
    postcode: string | null;
    country: string | null;
    latitude: number | null;
    longitude: number | null;
  };
  contact: {
    phone: string | null;
    alternative_phone: string | null;
    email: string | null;
    contact_person_name: string | null;
    contact_person_phone: string | null;
    contact_person_email: string | null;
  };
  timezone: string;
  manual_opening_status: string | null;
  manual_status_expires_at: string | null;
  opening_status: ApiOpeningStatus;
  opening_hours: ApiOpeningHour[];
  upcoming_closures: ApiBranchClosure[];
  created_at: string;
  updated_at: string;
}

export interface ApiBranchListParams {
  search?: string;
  status?: string;
  type?: string;
  city?: string;
  is_active?: "true" | "false";
  archived?: "true" | "false";
  include_archived?: "true";
  sort?: "name" | "branch_code" | "created_at" | "updated_at";
  direction?: "asc" | "desc";
  page?: number;
  limit?: number;
}
