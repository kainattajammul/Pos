export interface PreRepairChecklistItem {
  id: string;
  label: string;
}

/** Three-column layout matching the reference checklist modal. */
export const PRE_REPAIR_CHECKLIST_COLUMNS: PreRepairChecklistItem[][] = [
  [
    { id: "power-on-restart", label: "Power On/Restart" },
    { id: "home-face-id-error", label: "Home/Face ID Error" },
    { id: "home-button-function", label: "Home Button Function" },
    { id: "touch-functionality", label: "Touch Functionality" },
    { id: "post-clean-port", label: "Post Clean Port" },
    { id: "silent-switch", label: "Silent Switch" },
  ],
  [
    { id: "cell-signal", label: "Cell Signal" },
    { id: "sim-installed", label: "Sim Installed" },
    { id: "rear-cam", label: "Rear Cam" },
    { id: "front-cam", label: "Front Cam" },
    { id: "volume", label: "Volume" },
  ],
  [
    { id: "audio-ic", label: "Audio IC (i7&i7+)" },
    { id: "touch-ic", label: "Touch IC (i6&i6+)" },
    { id: "post-liquid-damage", label: "Post Liquid Damage" },
    { id: "post-charging", label: "Post Charging" },
    { id: "power-button", label: "Power Button" },
  ],
];

export const PRE_REPAIR_CHECKLIST_ITEM_IDS = PRE_REPAIR_CHECKLIST_COLUMNS.flat().map(
  (item) => item.id,
);

export function createEmptyChecklistState(): Record<string, boolean> {
  return Object.fromEntries(
    PRE_REPAIR_CHECKLIST_ITEM_IDS.map((id) => [id, false]),
  ) as Record<string, boolean>;
}

export const PRE_REPAIR_CHECKLIST_CATEGORY_OPTIONS = [
  "Mobile Repair",
  "Tablet Repair",
  "Computer Repair",
  "Drone Repair",
  "Jewelry Repair",
] as const;
