/** User row from GET /users (matches backend toPublicUser). */
export interface ApiUser {
  id: string | number;
  fullName: string;
  email: string;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserTableRow {
  id: number;
  fullName: string;
  email: string;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserPayload {
  fullName: string;
  email: string;
  password: string;
  phone?: string | null;
  shopId: number;
  roleId?: number | null;
  status?: "ACTIVE" | "INACTIVE" | "SUSPENDED";
}

export interface UpdateUserPayload {
  fullName?: string;
  email?: string;
  password?: string;
  phone?: string | null;
}

export interface UserMutationResult {
  id: number;
  fullName: string;
  email: string;
}
