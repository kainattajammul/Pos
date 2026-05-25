import type { CustomerTableRow } from "@/types/customer-table";

export function normalizePhoneDigits(value: string | null | undefined): string {
  return (value ?? "").replace(/\D/g, "");
}

/** Search customers by email or phone number (partial match). */
export function filterCustomersByEmailOrPhone(
  customers: CustomerTableRow[],
  query: string,
  limit = 8,
): CustomerTableRow[] {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const qLower = trimmed.toLowerCase();
  const qDigits = normalizePhoneDigits(trimmed);
  const hasEnoughDigits = qDigits.length >= 3;
  const hasEnoughEmail = qLower.length >= 2 && qLower.includes("@");

  if (!hasEnoughDigits && !hasEnoughEmail && qLower.length < 2) {
    return [];
  }

  const matches = customers.filter((customer) => {
    const email = customer.email.trim().toLowerCase();
    const phoneDigits = normalizePhoneDigits(customer.phone);

    if (qLower.includes("@") && email.includes(qLower)) return true;
    if (qLower.length >= 2 && email.includes(qLower)) return true;
    if (hasEnoughDigits && phoneDigits.includes(qDigits)) return true;

    return false;
  });

  return matches.slice(0, limit);
}
