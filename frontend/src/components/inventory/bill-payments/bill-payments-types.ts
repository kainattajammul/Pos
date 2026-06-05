export interface BillPaymentRecord {
  id: string;
  itemId: string;
  planName: string;
  providerName: string;
  networkName: string;
  planMsrp: number;
  airtimeMargin: number;
  unitCost: number;
  collectFee: number;
  tax911: number;
  createdOn: string;
}

export interface BillPaymentFiltersState {
  itemId: string;
  planName: string;
  providerName: string;
  networkName: string;
}

export const DEFAULT_BILL_PAYMENT_FILTERS: BillPaymentFiltersState = {
  itemId: "",
  planName: "",
  providerName: "",
  networkName: "",
};

export const MOCK_BILL_PAYMENTS: BillPaymentRecord[] = [];

export function formatBillPaymentMoney(value: number): string {
  return `£${value.toFixed(2)}`;
}

export function matchesBillPaymentFilters(
  row: BillPaymentRecord,
  filters: BillPaymentFiltersState,
): boolean {
  if (filters.itemId && !row.itemId.toLowerCase().includes(filters.itemId.toLowerCase())) {
    return false;
  }
  if (
    filters.planName &&
    !row.planName.toLowerCase().includes(filters.planName.toLowerCase())
  ) {
    return false;
  }
  if (
    filters.providerName &&
    !row.providerName.toLowerCase().includes(filters.providerName.toLowerCase())
  ) {
    return false;
  }
  if (
    filters.networkName &&
    !row.networkName.toLowerCase().includes(filters.networkName.toLowerCase())
  ) {
    return false;
  }
  return true;
}

export interface BillPaymentFormValues {
  planName: string;
  providerName: string;
  networkName: string;
  planMsrp: string;
  airtimeMargin: string;
  unitCost: string;
  collectFee: string;
  tax911: string;
}

export const DEFAULT_BILL_PAYMENT_FORM: BillPaymentFormValues = {
  planName: "",
  providerName: "",
  networkName: "",
  planMsrp: "",
  airtimeMargin: "",
  unitCost: "",
  collectFee: "",
  tax911: "",
};

export function formValuesToBillPayment(
  values: BillPaymentFormValues,
  existing?: BillPaymentRecord,
): BillPaymentRecord {
  const id = existing?.id ?? `bp-${Date.now()}`;
  return {
    id,
    itemId: existing?.itemId ?? `BP-${String(Date.now()).slice(-5)}`,
    planName: values.planName.trim(),
    providerName: values.providerName.trim(),
    networkName: values.networkName.trim(),
    planMsrp: Number(values.planMsrp) || 0,
    airtimeMargin: Number(values.airtimeMargin) || 0,
    unitCost: Number(values.unitCost) || 0,
    collectFee: Number(values.collectFee) || 0,
    tax911: Number(values.tax911) || 0,
    createdOn: existing?.createdOn ?? new Date().toLocaleDateString("en-GB"),
  };
}
