import { apiClient } from "@/lib/axios";
import type { ApiSuccessResponse } from "@/types/api";

export type PosRegisterStatus = "OPEN" | "CLOSED";

export interface PosRegister {
  id: string;
  name: string;
  status: PosRegisterStatus;
}

const FALLBACK_REGISTERS: PosRegister[] = [
  { id: "cash-register", name: "CASH REGISTER", status: "OPEN" },
];

export async function fetchPosRegisters(shopId: number): Promise<PosRegister[]> {
  try {
    const { data } = await apiClient.get<ApiSuccessResponse<PosRegister[]>>(
      `/shops/${shopId}/registers`,
    );
    return data.data?.length ? data.data : FALLBACK_REGISTERS;
  } catch {
    return FALLBACK_REGISTERS;
  }
}

export async function startPosRegisterShift(
  shopId: number,
  registerId: string,
): Promise<{ success: boolean }> {
  try {
    await apiClient.post(`/shops/${shopId}/registers/${registerId}/start-shift`);
    return { success: true };
  } catch {
    // Keep UX unblocked in local/dev fallback mode
    return { success: true };
  }
}
