export type RepairPartImageVariant =
  | "screen"
  | "oled-assembly"
  | "oled-frame"
  | "battery"
  | "home-button"
  | "digitizer-white"
  | "digitizer-black";

export interface RepairPart {
  id: string;
  name: string;
  price: number;
  onHand: number;
  image: RepairPartImageVariant;
  isAdd?: boolean;
}

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
