/** Maps API status strings to Prisma MemberStatus enum. */
export function parseMemberStatus(value) {
  if (value === undefined || value === null || value === "") {
    return "ACTIVE";
  }
  const normalized = String(value).trim().toUpperCase();
  if (normalized === "ACTIVE" || normalized === "INACTIVE" || normalized === "SUSPENDED") {
    return normalized;
  }
  return null;
}
