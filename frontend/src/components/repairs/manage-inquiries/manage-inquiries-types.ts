export type InquiryStatus = "New" | "Open" | "Closed" | "Cancelled";

export interface InquiryRecord {
  id: string;
  customerName: string;
  reference: string;
  inquiryValue: number;
  assignedTo: string;
  createdDate: string; // YYYY-MM-DD
  status: InquiryStatus;
  inquiryId: string;
  ticketId: string;
}

export interface InquiryFiltersState {
  inquiryId: string;
  customerName: string;
  createdDateRange: string;
  inquiryStatus: "All" | InquiryStatus;
  selectCriteria: "Ticket ID" | "Inquiry ID";
  criteriaValue: string;
  hideClosedInquiries: boolean;
}
