/** Default device issues seeded per repair device when none exist. */
export const DEFAULT_REPAIR_DEVICE_ISSUES = [
  { name: "Back Camera Replacement", slug: "back-camera", price: 35, iconKey: "camera-rear", sortOrder: 0 },
  { name: "Battery Replacement", slug: "battery", price: 45, iconKey: "battery", sortOrder: 1 },
  { name: "Charging Port Replacement", slug: "charging-port", price: 30, iconKey: "charging-port", sortOrder: 2 },
  { name: "Diagnostic", slug: "diagnostic", price: 45, iconKey: "diagnostic", sortOrder: 3 },
  { name: "Front Camera Replacement", slug: "front-camera", price: 80, iconKey: "camera-front", sortOrder: 4 },
  { name: "Screen (Digitizer + LCD) Replacement", slug: "screen", price: 45, iconKey: "screen", sortOrder: 5 },
  { name: "Speaker Replacement", slug: "speaker", price: 66, iconKey: "speaker", sortOrder: 6 },
  { name: "Volume Button Replacement", slug: "volume-button", price: 30, iconKey: "volume", sortOrder: 7 },
  { name: "Water Damage", slug: "water-damage", price: 45, iconKey: "water-damage", sortOrder: 8 },
];

export const REPAIR_DEVICE_ISSUE_ICON_CATALOG = [
  { key: "screen", label: "Screen / display" },
  { key: "battery", label: "Battery" },
  { key: "charging-port", label: "Charging port" },
  { key: "camera-front", label: "Front camera" },
  { key: "camera-rear", label: "Back camera" },
  { key: "speaker", label: "Speaker" },
  { key: "microphone", label: "Microphone" },
  { key: "volume", label: "Volume / power button" },
  { key: "power", label: "Power button" },
  { key: "water-damage", label: "Water damage" },
  { key: "diagnostic", label: "Diagnostic" },
  { key: "wifi", label: "Wi‑Fi / antenna" },
  { key: "bluetooth", label: "Bluetooth" },
  { key: "fingerprint", label: "Fingerprint sensor" },
  { key: "face-id", label: "Face ID" },
  { key: "sim-card", label: "SIM / card tray" },
  { key: "headphone", label: "Headphone jack" },
  { key: "vibration", label: "Vibration motor" },
  { key: "motherboard", label: "Motherboard / logic board" },
  { key: "back-glass", label: "Back glass" },
  { key: "frame", label: "Housing / frame" },
  { key: "software", label: "Software / OS" },
  { key: "data-recovery", label: "Data recovery" },
  { key: "general-repair", label: "General repair" },
];

export const REPAIR_DEVICE_ISSUE_ICON_KEYS = REPAIR_DEVICE_ISSUE_ICON_CATALOG.map(
  (item) => item.key,
);

export function searchRepairDeviceIssueIcons(query, limit = 40) {
  const q = String(query ?? "").trim().toLowerCase();
  const filtered = q
    ? REPAIR_DEVICE_ISSUE_ICON_CATALOG.filter(
        (item) =>
          item.key.includes(q) || item.label.toLowerCase().includes(q),
      )
    : REPAIR_DEVICE_ISSUE_ICON_CATALOG;
  return filtered.slice(0, limit);
}
