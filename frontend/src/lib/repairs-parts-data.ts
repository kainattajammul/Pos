export type RepairPartImageVariant =
  | "screen"
  | "lcd-panel"
  | "oled-assembly"
  | "oled-frame"
  | "touch-panel"
  | "digitizer-white"
  | "digitizer-black"
  | "battery"
  | "charging-port"
  | "charging-flex"
  | "home-button"
  | "power-button"
  | "volume-button"
  | "speaker"
  | "earpiece"
  | "microphone"
  | "vibrator"
  | "camera-front"
  | "camera-rear"
  | "proximity-sensor"
  | "sim-tray"
  | "back-glass"
  | "midframe"
  | "flex-cable"
  | "antenna"
  | "wifi-module"
  | "logic-board"
  | "screw-kit"
  | "adhesive";

export interface RepairPart {
  id: string;
  name: string;
  price: number;
  onHand: number;
  image: RepairPartImageVariant;
  imageUrl?: string | null;
  dbId?: number;
  isDefault?: boolean;
  isAdd?: boolean;
}

export const REPAIR_PART_IMAGE_VARIANTS: RepairPartImageVariant[] = [
  "screen",
  "lcd-panel",
  "oled-assembly",
  "oled-frame",
  "touch-panel",
  "digitizer-white",
  "digitizer-black",
  "battery",
  "charging-port",
  "charging-flex",
  "home-button",
  "power-button",
  "volume-button",
  "speaker",
  "earpiece",
  "microphone",
  "vibrator",
  "camera-front",
  "camera-rear",
  "proximity-sensor",
  "sim-tray",
  "back-glass",
  "midframe",
  "flex-cable",
  "antenna",
  "wifi-module",
  "logic-board",
  "screw-kit",
  "adhesive",
];

export const REPAIR_PART_VARIANT_LABELS: Record<RepairPartImageVariant, string> = {
  screen: "Screen",
  "lcd-panel": "LCD panel",
  "oled-assembly": "OLED assembly",
  "oled-frame": "OLED + frame",
  "touch-panel": "Touch panel",
  "digitizer-white": "Digitizer (white)",
  "digitizer-black": "Digitizer (black)",
  battery: "Battery",
  "charging-port": "Charging port",
  "charging-flex": "Charging flex",
  "home-button": "Home button",
  "power-button": "Power button",
  "volume-button": "Volume button",
  speaker: "Speaker",
  earpiece: "Earpiece",
  microphone: "Microphone",
  vibrator: "Vibrator",
  "camera-front": "Front camera",
  "camera-rear": "Rear camera",
  "proximity-sensor": "Proximity sensor",
  "sim-tray": "SIM tray",
  "back-glass": "Back glass",
  midframe: "Midframe",
  "flex-cable": "Flex cable",
  antenna: "Antenna",
  "wifi-module": "Wi‑Fi module",
  "logic-board": "Logic board",
  "screw-kit": "Screw kit",
  adhesive: "Adhesive",
};

export function normalizeRepairPartImageVariant(
  value: string | undefined | null,
): RepairPartImageVariant {
  if (value && REPAIR_PART_IMAGE_VARIANTS.includes(value as RepairPartImageVariant)) {
    return value as RepairPartImageVariant;
  }
  return "screen";
}

export const REPAIR_PARTS_FALLBACK: RepairPart[] = [
  {
    id: "add-part",
    name: "Add Part",
    price: 0,
    onHand: 0,
    image: "screen",
    isAdd: true,
  },
];

export const DEFAULT_REPAIR_PARTS: RepairPart[] = [
  {
    id: "add-part",
    name: "Add Part",
    price: 0,
    onHand: 0,
    image: "screen",
    isAdd: true,
  },
  {
    id: "iphone-12-screen",
    name: "iPhone 12 screen",
    price: 30,
    onHand: 1,
    image: "screen",
  },
  {
    id: "oled-assembly-iphone",
    name: "OLED Assembly Compatible For iPhone",
    price: 73,
    onHand: 24,
    image: "oled-assembly",
  },
  {
    id: "oled-assembly-frame",
    name: "OLED Assembly With Frame Compatible For",
    price: 0,
    onHand: 12,
    image: "oled-frame",
  },
  {
    id: "iphone-8-plus-battery",
    name: "iPhone 8 Plus Battery",
    price: 77,
    onHand: 14,
    image: "battery",
  },
  {
    id: "iphone-6s-home-button",
    name: "iPhone 6S/6S+ Space Grey Home Button",
    price: 1.5,
    onHand: 22,
    image: "home-button",
  },
  {
    id: "ipad-digitizer-white",
    name: "iPad 3/4 White Glass Digitizer",
    price: 7,
    onHand: 30,
    image: "digitizer-white",
  },
  {
    id: "ipad-digitizer-black",
    name: "iPad 3/4 Black Glass Digitizer",
    price: 9.5,
    onHand: 45,
    image: "digitizer-black",
  },
];

export function formatRepairPartPrice(price: number): string {
  return `$${price.toFixed(2)}`;
}
