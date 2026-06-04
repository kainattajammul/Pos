import { apiClient } from "@/lib/axios";
import {
  MOCK_REFURBISHMENT_BATCHES,
  type RefurbishmentBatchRecord,
} from "@/components/inventory/refurbishment-batch/refurbishment-batch-types";
import type { ApiSuccessResponse } from "@/types/api";

export interface ApiRefurbishmentBatch {
  id: number;
  batchId: string;
  batchName: string;
  batchDate: string;
  store: string;
  employee: string;
  totalItems: number;
  refurbishmentTicketId: string;
  status: RefurbishmentBatchRecord["status"];
}

function mapApiToRecord(row: ApiRefurbishmentBatch): RefurbishmentBatchRecord {
  return {
    id: String(row.id),
    batchId: row.batchId,
    batchName: row.batchName,
    batchDate: row.batchDate,
    store: row.store,
    employee: row.employee,
    totalItems: row.totalItems,
    refurbishmentTicketId: row.refurbishmentTicketId,
    status: row.status,
  };
}

export async function fetchRefurbishmentBatches(
  shopId: number,
): Promise<RefurbishmentBatchRecord[]> {
  try {
    const { data } = await apiClient.get<ApiSuccessResponse<ApiRefurbishmentBatch[]>>(
      "/refurbishment-batches",
      { params: { shopId } },
    );
    return data.data?.map(mapApiToRecord) ?? MOCK_REFURBISHMENT_BATCHES;
  } catch {
    return MOCK_REFURBISHMENT_BATCHES;
  }
}
