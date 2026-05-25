/**
 * Brand logos for manufacturer picker (simple-icons slugs).
 * Used for search in add/edit manufacturer dialog and default seed data.
 */
export const REPAIR_MANUFACTURER_BRANDS = [
  { key: "apple", label: "Apple", logoSlug: "apple" },
  { key: "samsung", label: "Samsung", logoSlug: "samsung" },
  { key: "google", label: "Google", logoSlug: "google" },
  { key: "microsoft", label: "Microsoft", logoSlug: "microsoft" },
  { key: "huawei", label: "Huawei", logoSlug: "huawei" },
  { key: "xiaomi", label: "Xiaomi", logoSlug: "xiaomi" },
  { key: "oneplus", label: "OnePlus", logoSlug: "oneplus" },
  { key: "motorola", label: "Motorola", logoSlug: "motorola" },
  { key: "nokia", label: "Nokia", logoSlug: "nokia" },
  { key: "sony", label: "Sony", logoSlug: "sony" },
  { key: "lg", label: "LG", logoSlug: "lg" },
  { key: "htc", label: "HTC", logoSlug: "htc" },
  { key: "blackberry", label: "BlackBerry", logoSlug: "blackberry" },
  { key: "asus", label: "Asus", logoSlug: "asus" },
  { key: "lenovo", label: "Lenovo", logoSlug: "lenovo" },
  { key: "dell", label: "Dell", logoSlug: "dell" },
  { key: "hp", label: "HP", logoSlug: "hp" },
  { key: "intel", label: "Intel", logoSlug: "intel" },
  { key: "amd", label: "AMD", logoSlug: "amd" },
  { key: "nvidia", label: "NVIDIA", logoSlug: "nvidia" },
  { key: "amazon", label: "Amazon", logoSlug: "amazon" },
  { key: "meta", label: "Meta", logoSlug: "meta" },
  { key: "oppo", label: "Oppo", logoSlug: "oppo" },
  { key: "vivo", label: "Vivo", logoSlug: "vivo" },
  { key: "realme", label: "Realme", logoSlug: "realme" },
  { key: "honor", label: "Honor", logoSlug: "honor" },
  { key: "zte", label: "ZTE", logoSlug: "zte" },
  { key: "kyocera", label: "Kyocera", logoSlug: "kyocera" },
  { key: "alcatel", label: "Alcatel", logoSlug: "alcatel" },
  { key: "essential", label: "Essential", logoSlug: "essential" },
  { key: "garmin", label: "Garmin", logoSlug: "garmin" },
  { key: "fitbit", label: "Fitbit", logoSlug: "fitbit" },
  { key: "gopro", label: "GoPro", logoSlug: "gopro" },
  { key: "dji", label: "DJI", logoSlug: "dji" },
  { key: "bose", label: "Bose", logoSlug: "bose" },
  { key: "jbl", label: "JBL", logoSlug: "jbl" },
  { key: "beats", label: "Beats", logoSlug: "beats" },
  { key: "philips", label: "Philips", logoSlug: "philips" },
  { key: "panasonic", label: "Panasonic", logoSlug: "panasonic" },
  { key: "toshiba", label: "Toshiba", logoSlug: "toshiba" },
  { key: "sharp", label: "Sharp", logoSlug: "sharp" },
  { key: "siemens", label: "Siemens", logoSlug: "siemens" },
  { key: "canon", label: "Canon", logoSlug: "canon" },
  { key: "nikon", label: "Nikon", logoSlug: "nikon" },
  { key: "epson", label: "Epson", logoSlug: "epson" },
  { key: "brother", label: "Brother", logoSlug: "brother" },
];

export function searchRepairManufacturerBrands(query = "", limit = 40) {
  const q = String(query).trim().toLowerCase();
  const filtered = q
    ? REPAIR_MANUFACTURER_BRANDS.filter(
        (item) =>
          item.key.includes(q) ||
          item.label.toLowerCase().includes(q) ||
          item.logoSlug.includes(q),
      )
    : REPAIR_MANUFACTURER_BRANDS;

  return filtered.slice(0, limit);
}
