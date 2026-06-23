export interface TimezoneOption {
  id: string;
  label: string;
  offset: string;
  region?: string;
}

export const TIMEZONE_OPTIONS: TimezoneOption[] = [
  { id: "Europe/London", label: "London", offset: "GMT+0", region: "United Kingdom" },
  { id: "Europe/Dublin", label: "Dublin", offset: "GMT+0", region: "Ireland" },
  { id: "Europe/Paris", label: "Paris", offset: "GMT+1", region: "France" },
  { id: "Europe/Berlin", label: "Berlin", offset: "GMT+1", region: "Germany" },
  { id: "Europe/Amsterdam", label: "Amsterdam", offset: "GMT+1", region: "Netherlands" },
  { id: "Europe/Madrid", label: "Madrid", offset: "GMT+1", region: "Spain" },
  { id: "Europe/Rome", label: "Rome", offset: "GMT+1", region: "Italy" },
  { id: "Europe/Stockholm", label: "Stockholm", offset: "GMT+1", region: "Sweden" },
  { id: "Europe/Warsaw", label: "Warsaw", offset: "GMT+1", region: "Poland" },
  { id: "Europe/Istanbul", label: "Istanbul", offset: "GMT+3", region: "Turkey" },
  { id: "Europe/Moscow", label: "Moscow", offset: "GMT+3", region: "Russia" },
  { id: "America/New_York", label: "New York", offset: "GMT-5", region: "United States" },
  { id: "America/Chicago", label: "Chicago", offset: "GMT-6", region: "United States" },
  { id: "America/Denver", label: "Denver", offset: "GMT-7", region: "United States" },
  { id: "America/Los_Angeles", label: "Los Angeles", offset: "GMT-8", region: "United States" },
  { id: "America/Toronto", label: "Toronto", offset: "GMT-5", region: "Canada" },
  { id: "America/Vancouver", label: "Vancouver", offset: "GMT-8", region: "Canada" },
  { id: "America/Mexico_City", label: "Mexico City", offset: "GMT-6", region: "Mexico" },
  { id: "America/Sao_Paulo", label: "São Paulo", offset: "GMT-3", region: "Brazil" },
  { id: "Asia/Dubai", label: "Dubai", offset: "GMT+4", region: "United Arab Emirates" },
  { id: "Asia/Karachi", label: "Karachi", offset: "GMT+5", region: "Pakistan" },
  { id: "Asia/Kolkata", label: "Kolkata", offset: "GMT+5:30", region: "India" },
  { id: "Asia/Dhaka", label: "Dhaka", offset: "GMT+6", region: "Bangladesh" },
  { id: "Asia/Bangkok", label: "Bangkok", offset: "GMT+7", region: "Thailand" },
  { id: "Asia/Singapore", label: "Singapore", offset: "GMT+8", region: "Singapore" },
  { id: "Asia/Hong_Kong", label: "Hong Kong", offset: "GMT+8", region: "Hong Kong" },
  { id: "Asia/Shanghai", label: "Shanghai", offset: "GMT+8", region: "China" },
  { id: "Asia/Tokyo", label: "Tokyo", offset: "GMT+9", region: "Japan" },
  { id: "Australia/Sydney", label: "Sydney", offset: "GMT+10", region: "Australia" },
  { id: "Pacific/Auckland", label: "Auckland", offset: "GMT+12", region: "New Zealand" },
];

export function getTimezoneOption(id: string): TimezoneOption | undefined {
  return TIMEZONE_OPTIONS.find((timezone) => timezone.id === id);
}

export function getTimezoneLabel(id: string): string {
  const option = getTimezoneOption(id);
  if (!option) return id || "Select timezone";
  return `${option.offset} · ${option.label} (${option.id})`;
}

export function getTimezoneOptions(value: string): TimezoneOption[] {
  const knownIds = new Set(TIMEZONE_OPTIONS.map((timezone) => timezone.id));
  if (!value || knownIds.has(value)) return TIMEZONE_OPTIONS;
  return [{ id: value, label: value, offset: "—", region: "Custom" }, ...TIMEZONE_OPTIONS];
}
