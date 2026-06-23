"use client";

import { Check, ChevronDown, Globe, Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { branchInputClass } from "@/components/branches/branch-ui-primitives";
import { getCountryOptions } from "@/lib/countries";
import { cn } from "@/lib/utils";

interface BranchCountrySelectProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
}

export function BranchCountrySelect({ value, onChange, id }: BranchCountrySelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [position, setPosition] = useState<{ left: number; top: number; width: number } | null>(
    null,
  );
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const options = getCountryOptions(value);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((country) => country.toLowerCase().includes(q));
  }, [options, query]);

  useEffect(() => {
    if (!open || !triggerRef.current) {
      setPosition(null);
      return;
    }

    const updatePosition = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const width = rect.width;
      const left = Math.min(Math.max(12, rect.left), window.innerWidth - width - 12);
      const spaceBelow = window.innerHeight - rect.bottom - 12;
      const panelHeight = 280;
      const top =
        spaceBelow >= panelHeight
          ? rect.bottom + 6
          : Math.max(12, rect.top - panelHeight - 6);

      setPosition({ left, top, width });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => searchRef.current?.focus(), 0);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onDocClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      setOpen(false);
      setQuery("");
    };

    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  const selectCountry = (country: string) => {
    onChange(country);
    setOpen(false);
    setQuery("");
  };

  const panel =
    open && position && typeof document !== "undefined"
      ? createPortal(
          <div
            ref={panelRef}
            style={{
              position: "fixed",
              left: position.left,
              top: position.top,
              width: position.width,
              zIndex: 10000,
            }}
            className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-xl"
          >
            <div className="border-b border-[#E5E7EB] bg-[#F9FAFB] p-3">
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#9CA3AF]" />
                <input
                  ref={searchRef}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search countries…"
                  className={cn(branchInputClass, "pl-9 text-sm")}
                />
              </div>
            </div>

            <ul className="scrollbar-hide max-h-56 overflow-y-auto p-1.5">
              {filtered.length === 0 ? (
                <li className="px-3 py-6 text-center text-sm text-[#9CA3AF]">No countries found</li>
              ) : (
                filtered.map((country) => {
                  const selected = country === value;
                  return (
                    <li key={country}>
                      <button
                        type="button"
                        onClick={() => selectCountry(country)}
                        className={cn(
                          "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                          selected
                            ? "bg-[color-mix(in_srgb,var(--repair-primary)_12%,white)] font-medium text-(--repair-primary)"
                            : "text-[#374151] hover:bg-[#F9FAFB]",
                        )}
                      >
                        <span className="truncate">{country}</span>
                        {selected ? <Check className="size-4 shrink-0" /> : null}
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={cn(
          branchInputClass,
          "flex w-full items-center justify-between gap-2 text-left",
          open && "border-(--repair-primary) ring-1 ring-(--repair-primary)",
        )}
      >
        <span className="flex min-w-0 items-center gap-2.5">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-[color-mix(in_srgb,var(--repair-primary)_10%,white)] text-(--repair-primary)">
            <Globe className="size-3.5" />
          </span>
          <span className="truncate text-sm font-medium text-[#111827]">
            {value || "Select country"}
          </span>
        </span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-[#9CA3AF] transition-transform",
            open && "rotate-180 text-(--repair-primary)",
          )}
        />
      </button>
      {panel}
    </>
  );
}
