"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import { useEffect, useRef } from "react";
import {
  clearSubcategories,
  countSelectedSubcategories,
  getSelectedSubcategoryLabels,
  isCategoryEnabled,
} from "@/lib/branch-website-services";
import { cn } from "@/lib/utils";

interface WebsiteServiceCategoryCardProps {
  label: string;
  subcategories: readonly { key: string; label: string }[];
  values: Record<string, boolean>;
  expanded: boolean;
  disabled?: boolean;
  onExpandedChange: (expanded: boolean) => void;
  onChange: (next: Record<string, boolean>) => void;
}

export function WebsiteServiceCategoryCard({
  label,
  subcategories,
  values,
  expanded,
  disabled = false,
  onExpandedChange,
  onChange,
}: WebsiteServiceCategoryCardProps) {
  const parentChecked = isCategoryEnabled(values);
  const selectedCount = countSelectedSubcategories(values);
  const selectedLabels = getSelectedSubcategoryLabels(subcategories, values);
  const wasParentChecked = useRef(parentChecked);

  useEffect(() => {
    if (wasParentChecked.current && !parentChecked) {
      onExpandedChange(false);
    }
    wasParentChecked.current = parentChecked;
  }, [parentChecked, onExpandedChange]);

  const handleParentCheckboxChange = () => {
    if (disabled) return;
    if (parentChecked) {
      onChange(clearSubcategories(values));
      onExpandedChange(false);
      return;
    }
    onExpandedChange(true);
  };

  const handleHeaderClick = () => {
    if (disabled) return;
    onExpandedChange(!expanded);
  };

  const handleSubcategoryChange = (key: string, checked: boolean) => {
    onChange({ ...values, [key]: checked });
  };

  return (
    <div className={cn(disabled && "opacity-60")}>
      <div
        className={cn(
          "rounded-md border transition-colors",
          parentChecked && !disabled
            ? "border-[#BBF7D0] bg-[#F0FDF4]"
            : "border-[#E5E7EB] bg-white",
        )}
      >
        <div className="flex items-start justify-between gap-2 px-3 py-2.5">
          <button
            type="button"
            onClick={handleHeaderClick}
            disabled={disabled}
            aria-expanded={expanded}
            className="flex min-w-0 flex-1 items-start gap-2 text-left disabled:cursor-not-allowed"
          >
            {expanded ? (
              <ChevronDown className="mt-0.5 size-4 shrink-0 text-[#6B7280]" />
            ) : (
              <ChevronRight className="mt-0.5 size-4 shrink-0 text-[#6B7280]" />
            )}
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    "text-sm font-medium",
                    disabled ? "text-[#9CA3AF]" : "text-[#374151]",
                  )}
                >
                  {label}
                </span>
                {parentChecked ? (
                  <span className="rounded-full bg-[#DCFCE7] px-2 py-0.5 text-xs font-medium text-[#166534]">
                    {selectedCount} selected
                  </span>
                ) : !expanded && !disabled ? (
                  <span className="text-xs text-[#9CA3AF]">Not configured</span>
                ) : null}
              </div>
              {!expanded && parentChecked ? (
                <p className="truncate text-xs text-[#6B7280]">{selectedLabels.join(", ")}</p>
              ) : !expanded && !disabled ? (
                <p className="text-xs text-[#9CA3AF]">Click to choose options</p>
              ) : null}
            </div>
          </button>
          <input
            type="checkbox"
            checked={parentChecked}
            disabled={disabled}
            onChange={handleParentCheckboxChange}
            onClick={(event) => event.stopPropagation()}
            className="mt-1 size-4 shrink-0 rounded border-[#D1D5DB] disabled:cursor-not-allowed"
            aria-label={`${label} category`}
          />
        </div>

        {expanded ? (
          <div className="space-y-2 border-t border-[#E5E7EB] px-3 py-3">
            {subcategories.map((subcategory) => {
              const checked = values[subcategory.key] ?? false;
              return (
                <label
                  key={subcategory.key}
                  className={cn(
                    "flex cursor-pointer items-center justify-between rounded-md border px-3 py-2 transition-colors",
                    checked && !disabled
                      ? "border-[#BBF7D0] bg-[#F0FDF4]"
                      : "border-[#E5E7EB] bg-white hover:bg-[#F9FAFB]",
                    disabled && "cursor-not-allowed hover:bg-white",
                  )}
                >
                  <span
                    className={cn(
                      "text-sm",
                      disabled ? "text-[#9CA3AF]" : checked ? "font-medium text-[#166534]" : "text-[#374151]",
                    )}
                  >
                    {subcategory.label}
                  </span>
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={disabled}
                    onChange={(event) =>
                      handleSubcategoryChange(subcategory.key, event.target.checked)
                    }
                    className="size-4 rounded border-[#D1D5DB] disabled:cursor-not-allowed"
                  />
                </label>
              );
            })}
            {!parentChecked && !disabled ? (
              <p className="text-xs text-[#9CA3AF]">Select at least one option to enable this category.</p>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
