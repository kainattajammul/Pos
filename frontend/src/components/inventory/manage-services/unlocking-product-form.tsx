"use client";

import { ChevronDown, Trash2, X } from "lucide-react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  UnlockingProductAdminHistory,
  type UnlockingAdminHistoryEntry,
} from "@/components/inventory/manage-services/unlocking-product-admin-history";
import {
  API_STATUS_OPTIONS,
  formatUnlockingPriceField,
  MANUFACTURER_OPTIONS,
  SUPPLIER_OPTIONS,
  SWAP_PRODUCT_OPTIONS,
  TAX_CLASS_OPTIONS,
  type UnlockingProductFormValues,
} from "@/components/inventory/manage-services/unlocking-product-form-types";

interface UnlockingProductFormProps {
  values: UnlockingProductFormValues;
  onChange: (next: UnlockingProductFormValues) => void;
  nameError?: string;
  selectedFileName?: string;
  adminHistory?: UnlockingAdminHistoryEntry[];
  onFileChange: (file: File | null) => void;
  onFileRemove: () => void;
  onSubmit: () => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const inputClass =
  "h-9 w-full rounded-sm border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] focus:border-(--repair-primary) focus:outline-none focus:ring-1 focus:ring-(--repair-primary)";

const textareaClass =
  "min-h-[96px] w-full resize-y rounded-sm border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#111827] focus:border-(--repair-primary) focus:outline-none focus:ring-1 focus:ring-(--repair-primary)";

const selectClass =
  "h-9 w-full appearance-none rounded-sm border border-[#E5E7EB] bg-white px-3 pr-9 text-sm text-[#111827] focus:border-(--repair-primary) focus:outline-none focus:ring-1 focus:ring-(--repair-primary)";

function setField<K extends keyof UnlockingProductFormValues>(
  current: UnlockingProductFormValues,
  key: K,
  value: UnlockingProductFormValues[K],
): UnlockingProductFormValues {
  return { ...current, [key]: value };
}

function SelectField({
  label,
  value,
  onChange,
  placeholder,
  options,
  clearable = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  options: readonly string[];
  clearable?: boolean;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-medium text-[#374151]">{label}</span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={clearable && value ? `${selectClass} pr-14` : selectClass}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        {clearable && value ? (
          <button
            type="button"
            className="absolute right-8 top-1/2 -translate-y-1/2 rounded-sm p-0.5 text-[#9CA3AF] hover:text-[#374151]"
            onClick={() => onChange("")}
            aria-label={`Clear ${label}`}
          >
            <X className="size-3.5" />
          </button>
        ) : null}
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-[#9CA3AF]" />
      </div>
    </label>
  );
}

export function UnlockingProductForm({
  values,
  onChange,
  nameError,
  selectedFileName,
  adminHistory = [],
  onFileChange,
  onFileRemove,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: UnlockingProductFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePriceBlur = (key: "retailPrice" | "costPrice" | "promotionalPrice") => {
    onChange(setField(values, key, formatUnlockingPriceField(values[key])));
  };

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <div className="grid grid-cols-1 gap-x-8 gap-y-4 lg:grid-cols-2">
        <div className="space-y-4">
          <label className="block space-y-1">
            <span className="text-xs font-medium text-[#374151]">
              Name <span className="text-[#DC2626]">*</span>
            </span>
            <input
              value={values.name}
              onChange={(e) => onChange(setField(values, "name", e.target.value))}
              className={inputClass}
              aria-invalid={Boolean(nameError)}
            />
            {nameError ? <p className="text-xs text-[#DC2626]">{nameError}</p> : null}
          </label>

          <label className="block space-y-1">
            <span className="text-xs font-medium text-[#374151]">Delivery Time</span>
            <input
              value={values.deliveryTime}
              onChange={(e) => onChange(setField(values, "deliveryTime", e.target.value))}
              className={inputClass}
            />
          </label>

          <SelectField
            label="Manufacturer"
            value={values.manufacturer}
            onChange={(manufacturer) => onChange(setField(values, "manufacturer", manufacturer))}
            placeholder="Select manufacturer"
            options={MANUFACTURER_OPTIONS}
            clearable
          />

          <label className="block space-y-1">
            <span className="text-xs font-medium text-[#374151]">Description</span>
            <textarea
              value={values.description}
              onChange={(e) => onChange(setField(values, "description", e.target.value))}
              rows={4}
              className={textareaClass}
            />
          </label>

          <label className="block space-y-1">
            <span className="text-xs font-medium text-[#374151]">Api Status</span>
            <div className="relative">
              <select
                value={values.apiStatus}
                onChange={(e) =>
                  onChange(
                    setField(
                      values,
                      "apiStatus",
                      e.target.value as UnlockingProductFormValues["apiStatus"],
                    ),
                  )
                }
                className={selectClass}
              >
                {API_STATUS_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-[#9CA3AF]" />
            </div>
          </label>

          <SelectField
            label="Supplier"
            value={values.supplier}
            onChange={(supplier) => onChange(setField(values, "supplier", supplier))}
            placeholder="Select Vendor"
            options={SUPPLIER_OPTIONS}
          />

          <SelectField
            label="Swap Product"
            value={values.swapProduct}
            onChange={(swapProduct) => onChange(setField(values, "swapProduct", swapProduct))}
            placeholder="Select an Option"
            options={SWAP_PRODUCT_OPTIONS}
          />

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={values.commission}
              onChange={(e) => onChange(setField(values, "commission", e.target.checked))}
              className="size-4 rounded border-[#D1D5DB]"
            />
            <span className="text-xs font-medium text-[#374151]">Commission</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={values.showOnPos}
              onChange={(e) => onChange(setField(values, "showOnPos", e.target.checked))}
              className="size-4 rounded border-[#D1D5DB]"
            />
            <span className="text-xs font-medium text-[#374151]">Show On Pos</span>
          </label>
        </div>

        <div className="space-y-4">
          <label className="block space-y-1">
            <span className="text-xs font-medium text-[#374151]">Retail Price</span>
            <input
              type="number"
              min={0}
              step="0.01"
              value={values.retailPrice}
              onChange={(e) => onChange(setField(values, "retailPrice", e.target.value))}
              onBlur={() => handlePriceBlur("retailPrice")}
              className={inputClass}
            />
          </label>

          <label className="block space-y-1">
            <span className="text-xs font-medium text-[#374151]">Cost Price</span>
            <input
              type="number"
              min={0}
              step="0.01"
              value={values.costPrice}
              onChange={(e) => onChange(setField(values, "costPrice", e.target.value))}
              onBlur={() => handlePriceBlur("costPrice")}
              className={inputClass}
            />
          </label>

          <label className="block space-y-1">
            <span className="text-xs font-medium text-[#374151]">Promotional Price</span>
            <input
              type="number"
              min={0}
              step="0.01"
              value={values.promotionalPrice}
              onChange={(e) => onChange(setField(values, "promotionalPrice", e.target.value))}
              onBlur={() => handlePriceBlur("promotionalPrice")}
              className={inputClass}
            />
          </label>

          <SelectField
            label="Tax Class"
            value={values.taxClass}
            onChange={(taxClass) => onChange(setField(values, "taxClass", taxClass))}
            placeholder="Select Tax Class"
            options={TAX_CLASS_OPTIONS}
          />

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={values.taxInclusive}
              onChange={(e) => onChange(setField(values, "taxInclusive", e.target.checked))}
              className="size-4 rounded border-[#D1D5DB]"
            />
            <span className="text-xs font-medium text-[#374151]">Tax Inclusive</span>
          </label>

          <div className="space-y-2">
            <span className="text-xs font-medium text-[#374151]">File Upload</span>
            <input
              ref={fileInputRef}
              type="file"
              className="block w-full text-sm text-[#374151] file:mr-3 file:rounded-sm file:border file:border-[#E5E7EB] file:bg-white file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-[#374151] hover:file:bg-pos-page"
              onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
            />
            <p className="text-xs text-[#9CA3AF]">
              {selectedFileName ?? "No file chosen"}
            </p>
            <Button
              type="button"
              variant="outline"
              className="h-9 gap-1.5 rounded-sm border-[#E5E7EB] bg-white px-3 text-sm font-medium text-[#374151] hover:bg-pos-page"
              onClick={() => {
                if (fileInputRef.current) fileInputRef.current.value = "";
                onFileRemove();
              }}
            >
              <Trash2 className="size-4" />
              Remove
            </Button>
          </div>
        </div>
      </div>

      <UnlockingProductAdminHistory rows={adminHistory} />

      <div className="border-t border-[#E5E7EB] pt-4">
        <div className="flex flex-wrap gap-2">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-9 rounded-sm border-0 bg-(--repair-primary) px-4 text-sm font-semibold text-(--repair-on-primary) hover:opacity-90"
          >
            Save
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            className="h-9 rounded-sm border-[#E5E7EB] bg-white px-4 text-sm font-medium text-[#374151] hover:bg-pos-page"
            onClick={onCancel}
          >
            Cancel
          </Button>
        </div>
      </div>
    </form>
  );
}
