import { apiClient } from "@/lib/axios";
import type { ApiSuccessResponse } from "@/types/api";
import type {
  ApiRole,
  CreateRolePayload,
  RoleMutationResult,
  RoleTableRow,
  UpdateRolePayload,
} from "@/types/role-table";

function toIsoString(value: string | Date | undefined): string {
  if (!value) return new Date().toISOString();
  return typeof value === "string" ? value : new Date(value).toISOString();
}

/** Maps API role to table row; description/status are UI-only until DB fields exist. */
export function mapApiRoleToRow(role: ApiRole): RoleTableRow {
  return {
    id: Number(role.id),
    roleName: role.name,
    shopId: role.shopId,
    description: null,
    status: "active",
    createdAt: toIsoString(role.createdAt),
  };
}

export async function fetchRoles(): Promise<RoleTableRow[]> {
  const { data } = await apiClient.get<ApiSuccessResponse<ApiRole[]>>("/roles");
  return data.data.map(mapApiRoleToRow);
}

export async function fetchRole(id: number): Promise<RoleTableRow> {
  const { data } = await apiClient.get<ApiSuccessResponse<ApiRole>>(`/roles/${id}`);
  return mapApiRoleToRow(data.data);
}

export async function createRole(payload: CreateRolePayload): Promise<RoleMutationResult> {
  const { data } = await apiClient.post<ApiSuccessResponse<RoleMutationResult>>(
    "/roles",
    payload,
  );
  return data.data;
}

export async function updateRole(
  id: number,
  payload: UpdateRolePayload,
): Promise<RoleMutationResult> {
  const { data } = await apiClient.put<ApiSuccessResponse<RoleMutationResult>>(
    `/roles/${id}`,
    payload,
  );
  return data.data;
}

export async function deleteRole(id: number): Promise<void> {
  await apiClient.delete<ApiSuccessResponse<undefined>>(`/roles/${id}`);
}
