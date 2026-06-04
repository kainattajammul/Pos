export type RefurbishmentBatchStatus =
  | "DRAFT"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export interface RefurbishmentBatchRecord {
  id: string;
  batchId: string;
  batchName: string;
  batchDate: string;
  store: string;
  employee: string;
  totalItems: number;
  refurbishmentTicketId: string;
  status: RefurbishmentBatchStatus;
}

export type RefurbishmentCriteria =
  | ""
  | "Batch ID"
  | "Batch Name"
  | "Store"
  | "Employee"
  | "Status"
  | "Batch Date";

export const REFURBISHMENT_CRITERIA_OPTIONS: { value: RefurbishmentCriteria; label: string }[] =
  [
    { value: "", label: "Please select" },
    { value: "Batch ID", label: "Batch ID" },
    { value: "Batch Name", label: "Batch Name" },
    { value: "Store", label: "Store" },
    { value: "Employee", label: "Employee" },
    { value: "Status", label: "Status" },
    { value: "Batch Date", label: "Batch Date" },
  ];

export interface RefurbishmentBatchFiltersState {
  criteria: RefurbishmentCriteria;
  criteriaValue: string;
}

export const DEFAULT_REFURBISHMENT_FILTERS: RefurbishmentBatchFiltersState = {
  criteria: "",
  criteriaValue: "",
};

/** Empty by default — matches screenshot empty state */
export const MOCK_REFURBISHMENT_BATCHES: RefurbishmentBatchRecord[] = [];

export function matchesRefurbishmentFilters(
  row: RefurbishmentBatchRecord,
  filters: RefurbishmentBatchFiltersState,
): boolean {
  if (!filters.criteria || !filters.criteriaValue.trim()) return true;

  const value = filters.criteriaValue.toLowerCase().trim();

  switch (filters.criteria) {
    case "Batch ID":
      return row.batchId.toLowerCase().includes(value);
    case "Batch Name":
      return row.batchName.toLowerCase().includes(value);
    case "Store":
      return row.store.toLowerCase().includes(value);
    case "Employee":
      return row.employee.toLowerCase().includes(value);
    case "Status":
      return row.status.toLowerCase().includes(value.replace(/\s/g, "_"));
    case "Batch Date":
      return row.batchDate.toLowerCase().includes(value);
    default:
      return true;
  }
}
