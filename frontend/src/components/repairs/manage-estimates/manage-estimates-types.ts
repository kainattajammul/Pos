export type EstimateStatus =
  | "Draft"
  | "Sent"
  | "Accepted"
  | "Declined"
  | "Expired"
  | "Converted";

export interface EstimateRecord {
  id: string;
  productService: string;
  customer: string;
  customerEmail: string;
  ticketLeadReference: string;
  createdDate: string; // YYYY-MM-DD
  total: number;
  status: EstimateStatus;
}

export interface EstimateFiltersState {
  estimateId: string;
  customerName: string;
  customerEmail: string;
  createdDateFrom: string;
  createdDateTo: string;
  status: "" | EstimateStatus;
  advanceFilter: string;
}
