"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { useRepairSearch } from "@/hooks/use-repair-search";
import { formatRepairSearchPrice } from "@/lib/repair-search-format";
import type { RepairSearchSelection } from "@/types/repair-search";
import { cn } from "@/lib/utils";

const DEBOUNCE_MS = 300;

interface RepairsSearchBarProps {
  shopId: number;
  onSelect: (selection: RepairSearchSelection) => void;
  className?: string;
}

export function RepairsSearchBar({ shopId, onSelect, className }: RepairsSearchBarProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(inputValue.trim().replace(/\s+/g, " "));
    }, DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [inputValue]);

  const showPanel = open && debouncedQuery.length > 0;

  const { data: results = [], isLoading, isFetching } = useRepairSearch(
    shopId,
    debouncedQuery,
    showPanel,
  );

  const loading = isLoading || isFetching;

  useEffect(() => {
    if (!showPanel) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [showPanel]);

  const handleSelect = (
    group: (typeof results)[number],
    repair: (typeof results)[number]["repairs"][number],
  ) => {
    const selection: RepairSearchSelection = {
      deviceId: group.device_id,
      repairTypeId: repair.repair_type_id,
      deviceCatalogKey: group.device_catalog_key,
      problemCatalogKey: repair.catalog_key,
      categorySlug: group.category_slug,
      manufacturerSlug: group.manufacturer_slug,
      deviceName: group.device_name,
      repairName: repair.repair_name,
    };
    onSelect(selection);
    setInputValue("");
    setDebouncedQuery("");
    setOpen(false);
  };

  return (
    <div ref={rootRef} className={cn("relative w-full min-w-0", className)}>
      <div
        className={cn(
          "flex items-center gap-3 border-b border-pos-strong pb-2 transition-colors",
          "focus-within:border-[var(--repair-primary)]",
        )}
      >
        <button
          type="button"
          className="shrink-0 text-pos-subtle transition-colors hover:text-[var(--repair-primary)]"
          aria-label="Focus search"
          onClick={() => inputRef.current?.focus()}
        >
          <Search className="size-5" strokeWidth={1.75} />
        </button>
        <input
          ref={inputRef}
          type="search"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search..."
          className="min-w-0 flex-1 border-0 bg-transparent text-sm text-pos outline-none placeholder:text-pos-subtle sm:text-base"
          aria-label="Search device or repair"
          aria-controls="repair-search-results"
          autoComplete="off"
        />
        {loading ? (
          <Loader2
            className="size-5 shrink-0 animate-spin text-[var(--repair-primary)]"
            aria-label="Searching"
          />
        ) : null}
      </div>

      {showPanel ? (
        <div
          id="repair-search-results"
          role="listbox"
          className="pos-dropdown absolute top-[calc(100%+8px)] left-0 right-0 z-50 max-h-[min(70vh,420px)] overflow-y-auto rounded-lg"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2 px-4 py-8 text-sm text-pos-muted">
              <Loader2 className="size-4 animate-spin text-[var(--repair-primary)]" />
              Searching repairs…
            </div>
          ) : results.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-pos-muted">No repairs found</p>
          ) : (
            <div className="py-2">
              {results.map((group) => (
                <div key={group.device_id} className="border-b border-pos last:border-0">
                  <p className="bg-pos-muted px-4 py-2.5 text-center text-sm font-bold text-pos">
                    {group.device_name}
                  </p>
                  <ul>
                    {group.repairs.map((repair, index) => (
                      <li key={repair.repair_type_id}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={false}
                          className={cn(
                            "pos-row-hover flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm transition",
                            index % 2 === 0 ? "pos-row-zebra-even" : "pos-row-zebra-odd",
                            "hover:bg-[color-mix(in_srgb,var(--repair-primary)_6%,var(--pos-surface))]",
                          )}
                          onClick={() => handleSelect(group, repair)}
                        >
                          <span className="min-w-0 flex-1 text-pos-secondary">
                            {repair.repair_name}
                          </span>
                          <span className="shrink-0 tabular-nums font-medium text-pos">
                            {formatRepairSearchPrice(repair.price)}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
