import { z } from "zod";
import type { SalesCommissionAgentTableRow } from "@/types/sales-commission-agent";

export const salesCommissionAgentFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z
    .string()
    .refine((v) => v === "" || z.email().safeParse(v).success, "Enter a valid email"),
  contactNumber: z.string(),
  address: z.string(),
  salesCommissionPercent: z
    .string()
    .refine(
      (v) => {
        const t = v.trim();
        if (t === "") return true;
        const n = Number(t);
        return Number.isFinite(n) && n >= 0 && n <= 100;
      },
      { message: "Enter a percentage between 0 and 100" },
    ),
});

export type SalesCommissionAgentFormValues = z.infer<typeof salesCommissionAgentFormSchema>;

export const SALES_COMMISSION_AGENT_FORM_DEFAULTS: SalesCommissionAgentFormValues = {
  name: "",
  email: "",
  contactNumber: "",
  address: "",
  salesCommissionPercent: "",
};

export function mapAgentToFormValues(
  agent: Pick<
    SalesCommissionAgentTableRow,
    "name" | "email" | "contactNumber" | "address" | "salesCommissionPercent"
  >,
): SalesCommissionAgentFormValues {
  return {
    name: agent.name,
    email: agent.email ?? "",
    contactNumber: agent.contactNumber ?? "",
    address: agent.address ?? "",
    salesCommissionPercent:
      agent.salesCommissionPercent != null ? String(agent.salesCommissionPercent) : "",
  };
}

export function formValuesToPayload(values: SalesCommissionAgentFormValues) {
  const percentRaw = values.salesCommissionPercent.trim();
  return {
    name: values.name.trim(),
    email: values.email.trim() || undefined,
    contactNumber: values.contactNumber.trim() || undefined,
    address: values.address.trim() || undefined,
    salesCommissionPercent:
      percentRaw === "" ? null : Number(Number(percentRaw).toFixed(2)),
  };
}
