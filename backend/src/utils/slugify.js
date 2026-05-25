/** Converts a display name to a URL-safe slug for repair categories. */
export function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/\+/g, "-plus")
    .replace(/&/g, "-and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
