import { apiClient } from "@/lib/axios";
import type { ApiSuccessResponse } from "@/types/api";
import type {
  ApiUser,
  CreateUserPayload,
  UpdateUserPayload,
  UserMutationResult,
  UserTableRow,
} from "@/types/user-table";

function toIsoString(value: string | Date): string {
  return typeof value === "string" ? value : new Date(value).toISOString();
}

/** Normalizes API user shape for the data table. */
export function mapApiUserToRow(user: ApiUser): UserTableRow {
  return {
    id: Number(user.id),
    fullName: user.fullName,
    email: user.email,
    phone: user.phone ?? null,
    createdAt: toIsoString(user.createdAt),
    updatedAt: toIsoString(user.updatedAt),
  };
}

export async function fetchUsers(): Promise<UserTableRow[]> {
  const { data } = await apiClient.get<ApiSuccessResponse<ApiUser[]>>("/users");
  return data.data.map(mapApiUserToRow);
}

export async function createUser(payload: CreateUserPayload): Promise<UserMutationResult> {
  const { data } = await apiClient.post<ApiSuccessResponse<UserMutationResult>>(
    "/users",
    payload,
  );
  return data.data;
}

export async function updateUser(
  id: number,
  payload: UpdateUserPayload,
): Promise<UserMutationResult> {
  const { data } = await apiClient.put<ApiSuccessResponse<UserMutationResult>>(
    `/users/${id}`,
    payload,
  );
  return data.data;
}

export async function deleteUser(id: number): Promise<void> {
  await apiClient.delete<ApiSuccessResponse<undefined>>(`/users/${id}`);
}
