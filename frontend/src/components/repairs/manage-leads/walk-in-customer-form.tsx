"use client";

import { forwardRef } from "react";
import { ChevronDown, Plus, Search, User } from "lucide-react";
import type { WalkInCustomerFormState } from "@/components/repairs/manage-leads/manage-leads-types";

interface WalkInCustomerFormProps {
  value: WalkInCustomerFormState;
  onChange: (next: WalkInCustomerFormState) => void;
}

function setField<K extends keyof WalkInCustomerFormState>(
  current: WalkInCustomerFormState,
  key: K,
  val: WalkInCustomerFormState[K],
): WalkInCustomerFormState {
  return { ...current, [key]: val };
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-xs font-medium text-[#374151]">{children}</span>;
}

const inputClass =
  "h-9 w-full rounded-sm border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:border-(--repair-primary) focus:outline-none focus:ring-1 focus:ring-(--repair-primary)";

const selectClass =
  "h-9 w-full appearance-none rounded-sm border border-[#E5E7EB] bg-white px-3 pr-8 text-sm text-[#111827] focus:border-(--repair-primary) focus:outline-none focus:ring-1 focus:ring-(--repair-primary)";

export const WalkInCustomerForm = forwardRef<HTMLElement, WalkInCustomerFormProps>(
  function WalkInCustomerForm({ value, onChange }, ref) {
    return (
      <section
        ref={ref}
        className="rounded-sm border border-[#E5E7EB] bg-white p-4"
      >
        <div className="mb-4 flex flex-wrap items-center gap-3 border-b border-[#E5E7EB] pb-4">
          <div className="flex size-10 items-center justify-center rounded-full border border-[#E5E7EB] bg-[#F9FAFB] text-[#9CA3AF]">
            <User className="size-5" />
          </div>
          <span className="text-sm font-semibold text-[#111827]">Walk in Customer</span>
          <div className="ml-auto flex flex-1 flex-wrap items-center justify-end gap-2 sm:max-w-md">
            <div className="relative min-w-[200px] flex-1">
              <input
                value={value.customerSearch}
                onChange={(e) =>
                  onChange(setField(value, "customerSearch", e.target.value))
                }
                placeholder="Search"
                className={`${inputClass} pr-9`}
              />
              <Search className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-[#9CA3AF]" />
            </div>
            <button
              type="button"
              className="flex size-9 items-center justify-center rounded-sm border border-[#E5E7EB] bg-white text-[#6B7280] hover:bg-[#F9FAFB]"
              aria-label="Expand customer options"
            >
              <ChevronDown className="size-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <label className="block space-y-1">
              <FieldLabel>Customer Name</FieldLabel>
              <div className="relative">
                <select
                  value={value.customerType}
                  onChange={(e) =>
                    onChange(setField(value, "customerType", e.target.value))
                  }
                  className={selectClass}
                >
                  <option value="Individual">Individual</option>
                  <option value="Business">Business</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-[#9CA3AF]" />
              </div>
            </label>

            <label className="block space-y-1">
              <FieldLabel>First Name</FieldLabel>
              <input
                value={value.firstName}
                onChange={(e) => onChange(setField(value, "firstName", e.target.value))}
                className={inputClass}
              />
            </label>

            <label className="block space-y-1">
              <FieldLabel>Phone</FieldLabel>
              <div className="flex gap-2">
                <div className="relative w-[100px] shrink-0">
                  <select
                    value={value.phoneType}
                    onChange={(e) =>
                      onChange(setField(value, "phoneType", e.target.value))
                    }
                    className={selectClass}
                  >
                    <option value="Mobile">Mobile</option>
                    <option value="Home">Home</option>
                    <option value="Work">Work</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-[#9CA3AF]" />
                </div>
                <input
                  value={value.phone}
                  onChange={(e) => onChange(setField(value, "phone", e.target.value))}
                  placeholder="Enter Mobile"
                  className={inputClass}
                />
              </div>
            </label>

            <label className="block space-y-1">
              <FieldLabel>Driving License</FieldLabel>
              <input
                value={value.drivingLicense}
                onChange={(e) =>
                  onChange(setField(value, "drivingLicense", e.target.value))
                }
                placeholder="Enter ..."
                className={inputClass}
              />
            </label>

            <div className="flex items-center gap-2">
              <FieldLabel>Email Alerts</FieldLabel>
              <button
                type="button"
                className="flex size-6 items-center justify-center rounded-sm border border-[#E5E7EB] text-[#6B7280] hover:bg-[#F9FAFB]"
                aria-label="Add email alert"
              >
                <Plus className="size-3.5" />
              </button>
            </div>

            <p className="text-xs font-medium text-[#374151]">Address</p>
          </div>

          <div className="space-y-3">
            <label className="block space-y-1">
              <FieldLabel>Tax Class</FieldLabel>
              <div className="relative">
                <select
                  value={value.taxClass}
                  onChange={(e) => onChange(setField(value, "taxClass", e.target.value))}
                  className={selectClass}
                >
                  <option value=""> </option>
                  <option value="Standard">Standard</option>
                  <option value="Reduced">Reduced</option>
                  <option value="Zero">Zero</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-[#9CA3AF]" />
              </div>
            </label>

            <label className="block space-y-1">
              <FieldLabel>Last Name</FieldLabel>
              <input
                value={value.lastName}
                onChange={(e) => onChange(setField(value, "lastName", e.target.value))}
                className={inputClass}
              />
            </label>

            <label className="block space-y-1">
              <FieldLabel>Email</FieldLabel>
              <div className="relative">
                <input
                  value={value.email}
                  onChange={(e) => onChange(setField(value, "email", e.target.value))}
                  placeholder="Search Customer"
                  className={inputClass}
                />
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-[#9CA3AF]" />
              </div>
            </label>
          </div>
        </div>
      </section>
    );
  },
);
