import { z } from "zod";

export const PREFIX_OPTIONS = ["", "Mr", "Mrs", "Ms", "Miss", "Dr", "Prof"] as const;

export const salesCommissionAgentFormSchema = z.object({
  prefix: z.string(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string(),
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
  prefix: "",
  firstName: "",
  lastName: "",
  email: "",
  contactNumber: "",
  address: "",
  salesCommissionPercent: "",
};

export function mapAgentToFormValues(
  agent: {
    prefix: string | null;
    firstName: string;
    lastName: string | null;
    email: string | null;
    contactNumber: string | null;
    address: string | null;
    salesCommissionPercent: number | null;
  },
): SalesCommissionAgentFormValues {
  return {
    prefix: agent.prefix ?? "",
    firstName: agent.firstName,
    lastName: agent.lastName ?? "",
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
    prefix: values.prefix.trim() || undefined,
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim() || undefined,
    email: values.email.trim() || undefined,
    contactNumber: values.contactNumber.trim() || undefined,
    address: values.address.trim() || undefined,
    salesCommissionPercent:
      percentRaw === "" ? null : Number(Number(percentRaw).toFixed(2)),
  };
}
