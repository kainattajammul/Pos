const BRANCH_UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isBranchUuid(value: string): boolean {
  return BRANCH_UUID_RE.test(value.trim());
}

export function isBranchNumericId(value: string): boolean {
  const trimmed = value.trim();
  return /^\d+$/.test(trimmed) && Number(trimmed) >= 1;
}

/** Matches backend branch route params (UUID or legacy numeric id). */
export function isBranchIdentifier(value: string): boolean {
  return isBranchUuid(value) || isBranchNumericId(value);
}
