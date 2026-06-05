"use client";

import { Info, X } from "lucide-react";
import { useEffect, useState } from "react";

const STORAGE_KEY = "settings-design-banner-dismissed-v1";

export function SettingsNotificationBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(localStorage.getItem(STORAGE_KEY) !== "1");
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="flex items-start gap-3 border-b border-(--repair-primary-dark) px-4 py-3 text-sm text-white md:px-5"
      style={{ backgroundColor: "var(--repair-primary)" }}
      role="status"
    >
      <Info className="mt-0.5 size-4 shrink-0 opacity-90" aria-hidden />
      <p className="min-w-0 flex-1 leading-relaxed">
        We&apos;ve made minor updates to the settings section design. Now you can use the
        search bar at the top of the left menu to find what you are looking for.
      </p>
      <button
        type="button"
        onClick={dismiss}
        className="shrink-0 rounded p-1 text-white/90 transition-colors hover:bg-white/15"
        aria-label="Dismiss notification"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
