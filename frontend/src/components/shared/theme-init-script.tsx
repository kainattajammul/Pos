/** Runs before paint: apply saved light/dark/system class + brand accent (reduces FOUC). */
export function ThemeInitScript() {
  const script = `
(function () {
  var THEME_KEY = "theme";
  var BRAND_STORAGE = "app-theme-v1";
  var LEGACY = "repairs-pos-theme-v1";
  var DEFAULTS = {
    orange: "#F97316",
    purple: "#8B5CF6",
    red: "#EF4444",
    teal: "#14B8A6",
    blue: "#3B82F6"
  };

  function applyColorMode() {
    var root = document.documentElement;
    var stored = localStorage.getItem(THEME_KEY);
    var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    var isDark =
      stored === "dark" || (stored === "system" && prefersDark) || (!stored && false);
    if (isDark) root.classList.add("dark");
    else root.classList.remove("dark");
  }

  function applyBrandColor() {
    try {
      var raw = localStorage.getItem(BRAND_STORAGE) || localStorage.getItem(LEGACY);
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
  }

  try {
    applyColorMode();
    applyBrandColor();
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
