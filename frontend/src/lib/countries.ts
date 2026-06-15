/** Common countries for branch / store address forms (UK first). */
export const COUNTRY_OPTIONS = [
  "United Kingdom",
  "Ireland",
  "United States",
  "Canada",
  "Australia",
  "New Zealand",
  "Germany",
  "France",
  "Spain",
  "Italy",
  "Netherlands",
  "Belgium",
  "Switzerland",
  "Austria",
  "Portugal",
  "Poland",
  "Sweden",
  "Norway",
  "Denmark",
  "Finland",
  "United Arab Emirates",
  "Saudi Arabia",
  "Qatar",
  "Pakistan",
  "India",
  "Bangladesh",
  "Sri Lanka",
  "Malaysia",
  "Singapore",
  "Hong Kong",
  "Japan",
  "South Korea",
  "China",
  "South Africa",
  "Nigeria",
  "Kenya",
  "Egypt",
  "Brazil",
  "Mexico",
] as const;

export function getCountryOptions(current?: string): string[] {
  const trimmed = current?.trim();
  if (!trimmed || COUNTRY_OPTIONS.includes(trimmed as (typeof COUNTRY_OPTIONS)[number])) {
    return [...COUNTRY_OPTIONS];
  }
  return [trimmed, ...COUNTRY_OPTIONS];
}
