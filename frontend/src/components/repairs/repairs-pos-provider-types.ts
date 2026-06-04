import type { RepairTicketProviderProps } from "@/contexts/repair-ticket-context";

/** Provider props synced from the repair workspace (no React children). */
export type RepairWorkspaceProviderProps = Omit<
  RepairTicketProviderProps,
  "children"
>;
