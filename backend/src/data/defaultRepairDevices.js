import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {Record<string, Record<string, string[]>>} */
let catalog = null;

function loadCatalog() {
  if (catalog) return catalog;
  const raw = readFileSync(
    join(__dirname, "defaultRepairDevicesCatalog.json"),
    "utf8",
  );
  catalog = JSON.parse(raw);
  return catalog;
}

/** Device names to seed for a category + manufacturer slug pair. */
export function getDefaultDeviceNames(categorySlug, manufacturerSlug) {
  const data = loadCatalog();
  const byManufacturer = data[categorySlug];
  if (!byManufacturer) return [];
  return byManufacturer[manufacturerSlug] ?? [];
}
