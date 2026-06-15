"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  branchInputClass,
  branchSelectClass,
} from "@/components/branches/branch-ui-primitives";
import type { BranchRecord, BranchType } from "@/lib/branch-types";
import { BRANCH_TYPE_LABELS } from "@/lib/branch-types";
import { getCountryOptions } from "@/lib/countries";

export interface BranchFormValues {
  code: string;
  name: string;
  type: BranchType;
  line1: string;
  line2: string;
  city: string;
  county: string;
  postcode: string;
  country: string;
  phone: string;
  email: string;
  managerName: string;
}

const EMPTY_FORM: BranchFormValues = {
  code: "",
  name: "",
  type: "standard",
  line1: "",
  line2: "",
  city: "",
  county: "",
  postcode: "",
  country: "United Kingdom",
  phone: "",
  email: "",
  managerName: "",
};

interface BranchFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  branch?: BranchRecord | null;
  isSubmitting?: boolean;
  onSubmit: (values: BranchFormValues) => void | Promise<void>;
}

export function BranchFormDialog({
  open,
  onOpenChange,
  mode,
  branch,
  isSubmitting,
  onSubmit,
}: BranchFormDialogProps) {
  const [form, setForm] = useState<BranchFormValues>(EMPTY_FORM);

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && branch) {
      setForm({
        code: branch.code,
        name: branch.name,
        type: branch.type,
        line1: branch.address.line1,
        line2: branch.address.line2,
        city: branch.address.city,
        county: branch.address.county,
        postcode: branch.address.postcode,
        country: branch.address.country,
        phone: branch.contact.phone,
        email: branch.contact.email,
        managerName: branch.contact.managerName,
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [open, mode, branch]);

  const update = <K extends keyof BranchFormValues>(key: K, value: BranchFormValues[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const countryOptions = getCountryOptions(form.country);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void Promise.resolve(onSubmit(form)).catch(() => {
      // Parent mutation onError shows a toast; swallow to avoid unhandled rejections.
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="scrollbar-hide max-h-[90vh] max-w-lg gap-0 overflow-hidden border border-[#E5E7EB] bg-white p-0">
        <div
          className="px-5 py-4"
          style={{ backgroundColor: "var(--repair-primary)" }}
        >
          <DialogTitle className="text-lg font-semibold text-white">
            {mode === "create" ? "Create Branch" : "Edit Branch"}
          </DialogTitle>
        </div>

        <form onSubmit={handleSubmit} className="scrollbar-hide max-h-[calc(90vh-140px)] overflow-y-auto p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1 sm:col-span-2">
              <span className="text-sm font-medium text-[#374151]">Branch name</span>
              <input
                required
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                className={branchInputClass}
                placeholder="Main Branch"
              />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium text-[#374151]">Branch code / ID</span>
              <input
                required
                value={form.code}
                onChange={(e) => update("code", e.target.value.toUpperCase())}
                className={branchInputClass}
                placeholder="BR-001"
                disabled={mode === "edit"}
              />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium text-[#374151]">Branch type</span>
              <select
                value={form.type}
                onChange={(e) => update("type", e.target.value as BranchType)}
                className={branchSelectClass}
              >
                {Object.entries(BRANCH_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1 sm:col-span-2">
              <span className="text-sm font-medium text-[#374151]">Address line 1</span>
              <input
                required
                value={form.line1}
                onChange={(e) => update("line1", e.target.value)}
                className={branchInputClass}
              />
            </label>
            <label className="space-y-1 sm:col-span-2">
              <span className="text-sm font-medium text-[#374151]">Address line 2</span>
              <input
                value={form.line2}
                onChange={(e) => update("line2", e.target.value)}
                className={branchInputClass}
              />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium text-[#374151]">City</span>
              <input
                required
                value={form.city}
                onChange={(e) => update("city", e.target.value)}
                className={branchInputClass}
              />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium text-[#374151]">Postcode</span>
              <input
                required
                value={form.postcode}
                onChange={(e) => update("postcode", e.target.value)}
                className={branchInputClass}
              />
            </label>
            <label className="space-y-1 sm:col-span-2">
              <span className="text-sm font-medium text-[#374151]">Country</span>
              <select
                required
                value={form.country}
                onChange={(e) => update("country", e.target.value)}
                className={branchSelectClass}
              >
                {countryOptions.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium text-[#374151]">Phone</span>
              <input
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                className={branchInputClass}
              />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium text-[#374151]">Email</span>
              <input
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                className={branchInputClass}
              />
            </label>
            <label className="space-y-1 sm:col-span-2">
              <span className="text-sm font-medium text-[#374151]">Branch manager</span>
              <input
                value={form.managerName}
                onChange={(e) => update("managerName", e.target.value)}
                className={branchInputClass}
              />
            </label>
          </div>

          <div className="mt-6 flex justify-end gap-2 border-t border-[#E5E7EB] pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="border-0 bg-(--repair-primary) text-(--repair-on-primary) hover:opacity-90"
            >
              {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
              {mode === "create" ? "Create branch" : "Save changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
