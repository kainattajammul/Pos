import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = fs.readFileSync(
  path.join(__dirname, "../../frontend/src/lib/repairs-devices-data.ts"),
  "utf8",
);
const match = src.match(
  /export const REPAIR_DEVICES_BY_CATEGORY[^=]+=\s*(\{[\s\S]*?\n\});\s*\n\/\*\*/,
);
if (!match) {
  console.error("Could not parse REPAIR_DEVICES_BY_CATEGORY");
  process.exit(1);
}
function categoryCatalog(_categoryId, byManufacturer) {
  return byManufacturer;
}
const catalog = eval(`(${match[1]})`);
const out = {};
for (const [cat, byMfr] of Object.entries(catalog)) {
  out[cat] = {};
  for (const [mfr, devices] of Object.entries(byMfr)) {
    out[cat][mfr] = devices.filter((d) => !d.isAdd).map((d) => d.name);
  }
}
const dest = path.join(__dirname, "../src/data/defaultRepairDevicesCatalog.json");
fs.writeFileSync(dest, JSON.stringify(out, null, 2));
console.log("written", dest);
