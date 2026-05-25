import type { NewCustomerFormValues } from "@/lib/repairs-customer-data";

export type CustomerStatus = "active" | "inactive";

export interface CustomerTableRow {
  id: number;
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  phone: string | null;
  customerGroup: string;
  taxClass: string;
  city: string | null;
  state: string | null;
  country: string;
  status: CustomerStatus;
  createdAt: string;
  updatedAt: string;
}

export type CustomerFormValues = NewCustomerFormValues & {
  status: CustomerStatus;
};

export type CreateCustomerPayload = CustomerFormValues;

export type UpdateCustomerPayload = CustomerFormValues;

export interface CustomerMutationResult {
  id: number;
  displayName: string;
}
