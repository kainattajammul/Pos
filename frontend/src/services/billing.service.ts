import {
  MOCK_BILLING_INVOICE_ROWS,
  MOCK_BILLING_SUMMARY,
  type BillingInvoiceRow,
  type BillingSummary,
} from "@/lib/billing-types";
import { STORE_DISPLAY_NAME } from "@/lib/store-settings-types";

export async function fetchBillingSummary(
  companyName?: string,
): Promise<BillingSummary> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  return {
    ...MOCK_BILLING_SUMMARY,
    companyName: companyName?.trim() || STORE_DISPLAY_NAME,
  };
}

export async function fetchBillingInvoices(): Promise<BillingInvoiceRow[]> {
  await new Promise((resolve) => setTimeout(resolve, 150));
  return MOCK_BILLING_INVOICE_ROWS;
}
