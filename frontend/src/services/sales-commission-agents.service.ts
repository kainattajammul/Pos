import { apiClient } from "@/lib/axios";
import type { ApiSuccessResponse } from "@/types/api";
import type {
  ApiSalesCommissionAgent,
  CreateSalesCommissionAgentPayload,
  SalesCommissionAgentMutationResult,
  SalesCommissionAgentTableRow,
  UpdateSalesCommissionAgentPayload,
} from "@/types/sales-commission-agent";

function toIsoString(value: string | Date): string {
  return typeof value === "string" ? value : new Date(value).toISOString();
}

export function mapApiAgentToRow(
  agent: ApiSalesCommissionAgent,
): SalesCommissionAgentTableRow {
  return {
    id: Number(agent.id),
    prefix: agent.prefix ?? null,
    firstName: agent.firstName,
    lastName: agent.lastName ?? null,
    fullName: agent.fullName,
    email: agent.email ?? null,
    contactNumber: agent.contactNumber ?? null,
    address: agent.address ?? null,
    salesCommissionPercent: agent.salesCommissionPercent ?? null,
    createdAt: toIsoString(agent.createdAt),
    updatedAt: toIsoString(agent.updatedAt),
  };
}

export async function fetchSalesCommissionAgents(): Promise<SalesCommissionAgentTableRow[]> {
  const { data } = await apiClient.get<ApiSuccessResponse<ApiSalesCommissionAgent[]>>(
    "/sales-commission-agents",
  );
  return data.data.map(mapApiAgentToRow);
}

export async function fetchSalesCommissionAgent(
  id: number,
): Promise<SalesCommissionAgentTableRow> {
  const { data } = await apiClient.get<ApiSuccessResponse<ApiSalesCommissionAgent>>(
    `/sales-commission-agents/${id}`,
  );
  return mapApiAgentToRow(data.data);
}

export async function createSalesCommissionAgent(
  payload: CreateSalesCommissionAgentPayload,
): Promise<SalesCommissionAgentMutationResult> {
  const { data } = await apiClient.post<
    ApiSuccessResponse<SalesCommissionAgentMutationResult>
  >("/sales-commission-agents", payload);
  return data.data;
}

export async function updateSalesCommissionAgent(
  id: number,
  payload: UpdateSalesCommissionAgentPayload,
): Promise<SalesCommissionAgentMutationResult> {
  const { data } = await apiClient.put<
    ApiSuccessResponse<SalesCommissionAgentMutationResult>
  >(`/sales-commission-agents/${id}`, payload);
  return data.data;
}

export async function deleteSalesCommissionAgent(id: number): Promise<void> {
  await apiClient.delete<ApiSuccessResponse<undefined>>(`/sales-commission-agents/${id}`);
}
