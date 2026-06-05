import { apiClient } from "@/lib/axios";
import {
  MOCK_BILL_PAYMENTS,
  type BillPaymentRecord,
} from "@/components/inventory/bill-payments/bill-payments-types";
import type { ApiSuccessResponse } from "@/types/api";

export async function fetchBillPayments(shopId: number): Promise<BillPaymentRecord[]> {
  try {
    const { data } = await apiClient.get<ApiSuccessResponse<BillPaymentRecord[]>>(
      `/shops/${shopId}/bill-payments`,
    );
    return data.data ?? [];
  } catch {
    return MOCK_BILL_PAYMENTS;
  }
}
