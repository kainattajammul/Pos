"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { useRepairTicket } from "@/contexts/repair-ticket-context";
import { useCustomers } from "@/hooks/use-customers";
import { filterCustomersByEmailOrPhone } from "@/lib/customer-search";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { CustomerTableRow } from "@/types/customer-table";

export function RepairsCustomerSearch() {
  const { selectCustomer } = useRepairTicket();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const { data: customers = [], isLoading } = useCustomers(
    open || query.trim().length > 0,
  );
  const [highlightIndex, setHighlightIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);

  const results = useMemo(
    () => filterCustomersByEmailOrPhone(customers, query),
    [customers, query],
  );

  useEffect(() => {
    setHighlightIndex(0);
  }, [query, results.length]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  const handleSelect = (customer: CustomerTableRow) => {
    selectCustomer(customer);
    setQuery("");
    setOpen(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open && (event.key === "ArrowDown" || event.key === "Enter") && results.length > 0) {
      setOpen(true);
      return;
    }

    if (!open || results.length === 0) {
      if (event.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightIndex((i) => (i + 1) % results.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightIndex((i) => (i - 1 + results.length) % results.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      const picked = results[highlightIndex];
      if (picked) handleSelect(picked);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  };

  const showDropdown = open && query.trim().length > 0;

  return (
    <div ref={rootRef} className="relative min-w-0 flex-1">
      <Search className="pointer-events-none absolute top-1/2 left-2.5 z-10 size-3.5 -translate-y-1/2 text-[#9CA3AF]" />
      <Input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => {
          if (query.trim()) setOpen(true);
        }}
        onKeyDown={handleKeyDown}
        placeholder="Search by email or phone"
        className="h-8 border-[#E5E7EB] pl-8 text-xs"
        aria-label="Search customer by email or phone"
        aria-expanded={showDropdown}
        aria-autocomplete="list"
        role="combobox"
        disabled={isLoading}
      />

      {showDropdown ? (
        <ul
          role="listbox"
          className="absolute top-full right-0 left-0 z-50 mt-1 max-h-[220px] overflow-y-auto rounded-md border border-[#E5E7EB] bg-white py-1 shadow-lg"
        >
          {isLoading ? (
            <li className="px-3 py-2 text-xs text-[#6B7280]">Loading customers…</li>
          ) : results.length === 0 ? (
            <li className="px-3 py-2 text-xs text-[#6B7280]">
              No customers match this email or phone number.
            </li>
          ) : (
            results.map((customer, index) => (
              <li key={customer.id} role="option" aria-selected={index === highlightIndex}>
                <button
                  type="button"
                  className={cn(
                    "flex w-full flex-col gap-0.5 px-3 py-2 text-left text-xs transition-colors",
                    index === highlightIndex
                      ? "bg-[var(--repair-primary-light)] text-[#111827]"
                      : "hover:bg-[#F9FAFB]",
                  )}
                  onMouseEnter={() => setHighlightIndex(index)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelect(customer)}
                >
                  <span className="font-semibold text-[#111827]">
                    {customer.displayName}
                  </span>
                  <span className="text-[#6B7280]">
                    {[customer.email, customer.phone].filter(Boolean).join(" · ")}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  );
}
