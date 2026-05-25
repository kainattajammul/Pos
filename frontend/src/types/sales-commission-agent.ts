export interface ApiSalesCommissionAgent {
  id: number;
  name: string;
  email: string | null;
  contactNumber: string | null;
  address: string | null;
  salesCommissionPercent: number | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface SalesCommissionAgentTableRow {
  id: number;
  name: string;
  email: string | null;
  contactNumber: string | null;
  address: string | null;
  salesCommissionPercent: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSalesCommissionAgentPayload {
  name: string;
  email?: string;
  contactNumber?: string;
  address?: string;
  salesCommissionPercent?: number | null;
}

export interface UpdateSalesCommissionAgentPayload {
  name?: string;
  email?: string;
  contactNumber?: string;
  address?: string;
  salesCommissionPercent?: number | null;
}

export type SalesCommissionAgentMutationResult = Pick<
  SalesCommissionAgentTableRow,
  "id" | "name" | "email"
>;
