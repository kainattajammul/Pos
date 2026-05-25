/**
 * Sort repair devices newest-first (e.g. iPhone 17 before iPhone 15).
 * Uses the largest number in the name as the model generation, then variant tier.
 */

function parseDeviceSortKey(name) {
  const lower = String(name).toLowerCase().trim();
  const numbers = lower.match(/\d+/g);
  const primary = numbers?.length
    ? Math.max(...numbers.map((n) => Number.parseInt(n, 10)))
    : 0;

  let variant = 0;
  if (/\bpro\s*max\b/.test(lower) || /\bultra\b/.test(lower)) variant = 4;
  else if (/\bpro\b/.test(lower)) variant = 3;
  else if (/\bplus\b/.test(lower) || /\b\+/.test(lower)) variant = 2;
  else if (/\bmini\b/.test(lower)) variant = 1;
  else if (/\bmax\b/.test(lower)) variant = 2;
  else if (/\bse\b/.test(lower)) variant = -1;

  return { primary, variant, lower };
}

/** Negative = a before b (newer / higher priority first). */
export function compareRepairDevices(a, b) {
  const ka = parseDeviceSortKey(a.name ?? a);
  const kb = parseDeviceSortKey(b.name ?? b);

  if (kb.primary !== ka.primary) return kb.primary - ka.primary;
  if (kb.variant !== ka.variant) return kb.variant - ka.variant;
  return ka.lower.localeCompare(kb.lower);
}

/** Newest models first. */
export function sortRepairDevices(devices) {
  return [...devices].sort(compareRepairDevices);
}

/** Index for sortOrder (0 = shown first). */
export function sortOrderForDeviceName(existingDevices, newName) {
  const sorted = sortRepairDevices([
    ...existingDevices,
    { name: newName },
  ]);
  return sorted.findIndex((d) => d.name === newName);
}
