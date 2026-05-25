/** Runs before paint to apply saved brand color and reduce theme flash. */
export function ThemeInitScript() {
  const script = `
(function () {
  var STORAGE = "app-theme-v1";
  var LEGACY = "repairs-pos-theme-v1";
  var DEFAULTS = {
    orange: "#F97316",
    purple: "#8B5CF6",
    red: "#EF4444",
    teal: "#14B8A6",
    blue: "#3B82F6"
  };
  try {
    var raw = localStorage.getItem(STORAGE) || localStorage.getItem(LEGACY);
    if (!raw) return;
    var state = JSON.parse(raw);
    var id = state.activeId || "orange";
    var hex = DEFAULTS[id];
    if (!hex && state.customSwatches) {
      for (var i = 0; i < state.customSwatches.length; i++) {
        if (state.customSwatches[i].id === id) {
          hex = state.customSwatches[i].color;
          break;
        }
      }
    }
    if (!hex) hex = DEFAULTS.orange;
    var root = document.documentElement;
    root.style.setProperty("--primary", hex);
    root.style.setProperty("--repair-primary", hex);
    root.style.setProperty("--ring", hex);
    root.style.setProperty("--sidebar-primary", hex);
  } catch (e) {}
})();
`;

  return (
    <script
      dangerouslySetInnerHTML={{ __html: script }}
      suppressHydrationWarning
    />
  );
}
