"use client";

import { ChevronDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { EstimateLineItem } from "@/components/repairs/manage-estimates/create-estimate-types";
import { cn } from "@/lib/utils";

const cellSelect =
  "h-9 w-full min-w-[110px] appearance-none rounded-md border border-[#E5E7EB] bg-white px-2 pr-7 text-xs text-[#111827] focus:border-(--repair-primary) focus:outline-none focus:ring-1 focus:ring-(--repair-primary)";
const cellInput =
  "h-9 w-full min-w-[70px] rounded-md border border-[#E5E7EB] bg-white px-2 text-xs text-[#111827] focus:border-(--repair-primary) focus:outline-none focus:ring-1 focus:ring-(--repair-primary)";
const cellTextarea =
  "min-h-[72px] w-full min-w-[140px] resize-y rounded-md border border-[#E5E7EB] bg-white px-2 py-1.5 text-xs text-[#111827] focus:border-(--repair-primary) focus:outline-none focus:ring-1 focus:ring-(--repair-primary)";

interface EstimateItemsTableProps {
  items: EstimateLineItem[];
  onChange: (items: EstimateLineItem[]) => void;
}

function updateItem(
  items: EstimateLineItem[],
  id: string,
  patch: Partial<EstimateLineItem>,
): EstimateLineItem[] {
  return items.map((item) => (item.id === id ? { ...item, ...patch } : item));
}

function SelectCell({
  value,
  options,
  placeholder,
  onChange,
}: {
  value: string;
  options: { value: string; label: string }[];
  placeholder?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cellSelect}
      >
        {placeholder ? (
          <option value="">{placeholder}</option>
        ) : null}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-[#9CA3AF]" />
    </div>
  );
}

export function EstimateItemsTable({ items, onChange }: EstimateItemsTableProps) {
  const setItem = (id: string, patch: Partial<EstimateLineItem>) => {
    onChange(updateItem(items, id, patch));
  };

  const addRow = () => {
    onChange([
      ...items,
      {
        id: `line-${Date.now()}`,
        type: "Service",
        category: "",
        device: "",
        productService: "",
        description: "",
        notes: "",
        internalNotes: "",
        qty: 1,
        price: 0,
        taxClass: "",
        discount: 0,
        discountReason: "",
      },
    ]);
  };

  return (
    <div className="mt-4 overflow-hidden rounded-md border border-[#E5E7EB] bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-[1280px] w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-[#E5E7EB] bg-[#FAFBFC] text-xs font-semibold text-[#374151]">
              <th className="px-2 py-2.5">Type</th>
              <th className="px-2 py-2.5">Category</th>
              <th className="px-2 py-2.5">Device</th>
              <th className="px-2 py-2.5">Product/Service</th>
              <th className="px-2 py-2.5">Description</th>
              <th className="px-2 py-2.5">Notes</th>
              <th className="px-2 py-2.5">QTY</th>
              <th className="px-2 py-2.5">Price</th>
              <th className="px-2 py-2.5">Tax Class</th>
              <th className="px-2 py-2.5">Discount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-[#E5E7EB] align-top">
                <td className="px-2 py-2">
                  <SelectCell
                    value={item.type}
                    options={[
                      { value: "Service", label: "Service" },
                      { value: "Product", label: "Product" },
                      { value: "Part", label: "Part" },
                    ]}
                    onChange={(v) => setItem(item.id, { type: v as EstimateLineItem["type"] })}
                  />
                </td>
                <td className="px-2 py-2">
                  <SelectCell
                    value={item.category}
                    placeholder="Select Category"
                    options={[
                      { value: "Mobile Repair", label: "Mobile Repair" },
                      { value: "Accessories", label: "Accessories" },
                    ]}
                    onChange={(v) => setItem(item.id, { category: v })}
                  />
                </td>
                <td className="px-2 py-2">
                  <SelectCell
                    value={item.device}
                    placeholder="Select Device"
                    options={[
                      { value: "iPhone 15", label: "iPhone 15" },
                      { value: "Samsung S23", label: "Samsung S23" },
                    ]}
                    onChange={(v) => setItem(item.id, { device: v })}
                  />
                </td>
                <td className="px-2 py-2">
                  <SelectCell
                    value={item.productService}
                    placeholder="Select Problems"
                    options={[
                      { value: "Screen Repair", label: "Screen Repair" },
                      { value: "Battery Replacement", label: "Battery Replacement" },
                    ]}
                    onChange={(v) => setItem(item.id, { productService: v })}
                  />
                </td>
                <td className="px-2 py-2">
                  <textarea
                    value={item.description}
                    onChange={(e) => setItem(item.id, { description: e.target.value })}
                    className={cellTextarea}
                  />
                </td>
                <td className="px-2 py-2">
                  <textarea
                    value={item.notes}
                    onChange={(e) => setItem(item.id, { notes: e.target.value })}
                    className={cellTextarea}
                  />
                  <button
                    type="button"
                    className="mt-1 text-xs font-medium text-(--repair-primary) hover:underline"
                    onClick={() => {
                      const note = window.prompt("Internal notes", item.internalNotes);
                      if (note !== null) setItem(item.id, { internalNotes: note });
                    }}
                  >
                    Add Internal Notes
                  </button>
                </td>
                <td className="px-2 py-2">
                  <input
                    type="number"
                    min={0}
                    value={item.qty || ""}
                    onChange={(e) =>
                      setItem(item.id, { qty: Number.parseFloat(e.target.value) || 0 })
                    }
                    className={cn(cellInput, "min-w-[56px]")}
                  />
                </td>
                <td className="px-2 py-2">
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={item.price || ""}
                    onChange={(e) =>
                      setItem(item.id, { price: Number.parseFloat(e.target.value) || 0 })
                    }
                    className={cellInput}
                  />
                </td>
                <td className="px-2 py-2">
                  <SelectCell
                    value={item.taxClass}
                    placeholder="Select a tax class"
                    options={[
                      { value: "Standard", label: "Standard" },
                      { value: "Reduced", label: "Reduced" },
                      { value: "Zero", label: "Zero" },
                    ]}
                    onChange={(v) => setItem(item.id, { taxClass: v })}
                  />
                </td>
                <td className="px-2 py-2">
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={item.discount || ""}
                    onChange={(e) =>
                      setItem(item.id, { discount: Number.parseFloat(e.target.value) || 0 })
                    }
                    className={cellInput}
                  />
                  <button
                    type="button"
                    className="mt-1 text-xs text-(--repair-primary) hover:underline"
                    onClick={() => {
                      const reason = window.prompt("Discount reason", item.discountReason);
                      if (reason !== null) setItem(item.id, { discountReason: reason });
                    }}
                  >
                    Add Reason
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="border-t border-[#E5E7EB] px-3 py-2">
        <Button
          type="button"
          variant="ghost"
          className="h-8 text-sm text-(--repair-primary)"
          onClick={addRow}
        >
          <Plus className="size-4" />
          Add line item
        </Button>
      </div>
    </div>
  );
}
