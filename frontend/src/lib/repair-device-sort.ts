import type { RepairDevice } from "@/lib/repairs-devices-data";

function parseDeviceSortKey(name: string) {
  const lower = name.toLowerCase().trim();
  const numbers = lower.match(/\d+/g);
  const primary = numbers?.length
    ? Math.max(...numbers.map((n) => Number.parseInt(n, 10)))
    : 0;

  let variant = 0;
  if (/\bpro\s*max\b/.test(lower) || /\bultra\b/.test(lower)) variant = 4;
  else if (/\bpro\b/.test(lower)) variant = 3;
  else if (/\bplus\b/.test(lower) || /\+/.test(lower)) variant = 2;
  else if (/\bmini\b/.test(lower)) variant = 1;
  else if (/\bmax\b/.test(lower)) variant = 2;
  else if (/\bse\b/.test(lower)) variant = -1;

  return { primary, variant, lower };
}

/** Newest / highest model number first. */
export function compareRepairDevices(
  a: Pick<RepairDevice, "name">,
  b: Pick<RepairDevice, "name">,
): number {
  const ka = parseDeviceSortKey(a.name);
  const kb = parseDeviceSortKey(b.name);

  if (kb.primary !== ka.primary) return kb.primary - ka.primary;
  if (kb.variant !== ka.variant) return kb.variant - ka.variant;
  return ka.lower.localeCompare(kb.lower);
}

export function sortRepairDevices<T extends Pick<RepairDevice, "name">>(devices: T[]): T[] {
  return [...devices].sort(compareRepairDevices);
}
