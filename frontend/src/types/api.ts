export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T;
  meta?: PaginationMeta;
  requestId?: string;
}

export interface ApiErrorDetail {
  path?: string;
  message: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: ApiErrorDetail[];
  requestId?: string;
  error?: {
    code?: string;
    message?: string;
  };
}

export type UserRole =
  | "ADMIN"
  | "MANAGER"
  | "CASHIER"
  | "TECHNICIAN"
  | "INVENTORY_MANAGER"
  | "ACCOUNTANT";

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  name: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

/** Backend login payload (refresh token is httpOnly cookie). */
export interface BackendLoginData {
  accessToken: string;
  user: AuthUser;
  refreshExpiresAt?: string;
}

export interface LoginResponse {
  user: AuthUser;
  accessToken: string;
}
