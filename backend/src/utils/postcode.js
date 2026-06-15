/** Normalise UK postcodes for comparison (not UK-only system — configurable later). */
export function normalisePostcode(postcode, country = "United Kingdom") {
  if (!postcode) return "";
  const raw = String(postcode).trim().toUpperCase().replace(/\s+/g, " ");
  if (country === "United Kingdom" || country === "UK" || country === "GB") {
    return raw.replace(/\s/g, "");
  }
  return raw;
}

export function formatUkPostcode(postcode) {
  const n = normalisePostcode(postcode);
  if (n.length <= 3) return n;
  return `${n.slice(0, -3)} ${n.slice(-3)}`.trim();
}
