export interface ApiSalesCommissionAgent {
  id: number;
  prefix: string | null;
  firstName: string;
  lastName: string | null;
  fullName: string;
  email: string | null;
  contactNumber: string | null;
  address: string | null;
  salesCommissionPercent: number | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface SalesCommissionAgentTableRow {
  id: number;
  prefix: string | null;
  firstName: string;
  lastName: string | null;
  fullName: string;
  email: string | null;
  contactNumber: string | null;
  address: string | null;
  salesCommissionPercent: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSalesCommissionAgentPayload {
  prefix?: string;
  firstName: string;
  lastName?: string;
  email?: string;
  contactNumber?: string;
  address?: string;
  salesCommissionPercent?: number | null;
}

export interface UpdateSalesCommissionAgentPayload {
  prefix?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  contactNumber?: string;
  address?: string;
  salesCommissionPercent?: number | null;
}

export type SalesCommissionAgentMutationResult = Pick<
  SalesCommissionAgentTableRow,
  "id" | "fullName" | "firstName" | "lastName" | "email"
>;
