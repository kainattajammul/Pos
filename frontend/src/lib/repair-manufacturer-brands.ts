/** Brand logo URL via Simple Icons CDN */
export function getManufacturerBrandLogoUrl(logoSlug: string): string {
  return `https://cdn.jsdelivr.net/npm/simple-icons@11.14.0/icons/${logoSlug}.svg`;
}

export interface ManufacturerBrandOption {
  key: string;
  label: string;
  logoSlug: string;
}
