/**
 * Curated Lucide-style icon keys for repair category picker search.
 * Keys map to PascalCase Lucide component names on the frontend.
 */
export const REPAIR_CATEGORY_ICON_CATALOG = [
  { key: "smartphone", label: "Smartphone" },
  { key: "tablet", label: "Tablet" },
  { key: "laptop", label: "Laptop" },
  { key: "monitor", label: "Monitor" },
  { key: "tv", label: "TV" },
  { key: "watch", label: "Watch" },
  { key: "gamepad-2", label: "Gamepad" },
  { key: "radio", label: "Radio / Drone" },
  { key: "gem", label: "Jewelry" },
  { key: "wrench", label: "Wrench" },
  { key: "hammer", label: "Hammer" },
  { key: "screwdriver", label: "Screwdriver" },
  { key: "cpu", label: "CPU" },
  { key: "hard-drive", label: "Hard drive" },
  { key: "battery", label: "Battery" },
  { key: "plug", label: "Plug" },
  { key: "camera", label: "Camera" },
  { key: "headphones", label: "Headphones" },
  { key: "speaker", label: "Speaker" },
  { key: "printer", label: "Printer" },
  { key: "router", label: "Router" },
  { key: "wifi", label: "Wi‑Fi" },
  { key: "bluetooth", label: "Bluetooth" },
  { key: "usb", label: "USB" },
  { key: "shield", label: "Shield" },
  { key: "lock", label: "Lock" },
  { key: "key", label: "Key" },
  { key: "settings", label: "Settings" },
  { key: "tool-case", label: "Tool case" },
  { key: "package", label: "Package" },
  { key: "truck", label: "Delivery" },
  { key: "store", label: "Store" },
  { key: "building-2", label: "Building" },
  { key: "car", label: "Car" },
  { key: "bike", label: "Bike" },
  { key: "plane", label: "Plane" },
  { key: "ship", label: "Ship" },
  { key: "zap", label: "Power" },
  { key: "droplet", label: "Water damage" },
  { key: "flame", label: "Heat" },
  { key: "snowflake", label: "Cooling" },
  { key: "circle-dollar-sign", label: "Pricing" },
  { key: "clipboard-check", label: "Checklist" },
  { key: "stethoscope", label: "Diagnostics" },
];

export function searchRepairCategoryIcons(query = "", limit = 32) {
  const q = String(query).trim().toLowerCase();
  const filtered = q
    ? REPAIR_CATEGORY_ICON_CATALOG.filter(
        (item) =>
          item.key.includes(q) || item.label.toLowerCase().includes(q),
      )
    : REPAIR_CATEGORY_ICON_CATALOG;

  return filtered.slice(0, limit);
}
