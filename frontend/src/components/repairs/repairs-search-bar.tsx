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
    <div ref={rootRef} className={cn("relative w-full min-w-0 max-w-xl", className)}>
      <div className="flex items-stretch overflow-hidden rounded-full border border-[#D1D5DB] bg-white shadow-sm">
        <input
          type="search"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search device or repair…"
          className="h-11 min-w-0 flex-1 border-0 bg-transparent px-4 text-sm text-[#111827] outline-none placeholder:text-[#9CA3AF] sm:h-12 sm:px-5 sm:text-base"
          aria-label="Search device or repair"
          aria-expanded={showPanel}
          aria-controls="repair-search-results"
          autoComplete="off"
        />
        <button
          type="button"
          className="flex h-11 w-12 shrink-0 items-center justify-center bg-[#111827] text-white transition hover:bg-[#1F2937] sm:h-12 sm:w-14"
          aria-label="Search repairs"
          onClick={() => setOpen(true)}
        >
          <Search className="size-5" />
        </button>
      </div>

      {showPanel ? (
        <div
          id="repair-search-results"
          role="listbox"
          className="absolute top-[calc(100%+8px)] right-0 z-50 max-h-[min(70vh,420px)] w-full min-w-[280px] overflow-y-auto rounded-xl border border-[#E5E7EB] bg-white shadow-lg"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2 px-4 py-8 text-sm text-[#6B7280]">
              <Loader2 className="size-4 animate-spin" />
              Searching repairs…
            </div>
          ) : results.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-[#6B7280]">No repairs found</p>
          ) : (
            <div className="py-2">
              {results.map((group) => (
                <div key={group.device_id} className="border-b border-[#F3F4F6] last:border-0">
                  <p className="bg-[#F9FAFB] px-4 py-2.5 text-center text-sm font-bold text-[#111827]">
                    {group.device_name}
                  </p>
                  <ul>
                    {group.repairs.map((repair, index) => (
                      <li key={repair.repair_type_id}>
                        <button
                          type="button"
                          role="option"
                          className={cn(
                            "flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm transition hover:bg-[#EFF6FF]",
                            index % 2 === 0 ? "bg-white" : "bg-[#F9FAFB]",
                          )}
                          onClick={() => handleSelect(group, repair)}
                        >
                          <span className="min-w-0 flex-1 text-[#374151]">
                            {repair.repair_name}
                          </span>
                          <span className="shrink-0 tabular-nums font-medium text-[#111827]">
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
