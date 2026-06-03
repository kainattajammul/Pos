"use client";

import { ChevronDown } from "lucide-react";

interface LeadSearchFilterPanelProps {
  customerName: string;
  leadId: string;
  status: string;
  onCustomerNameChange: (v: string) => void;
  onLeadIdChange: (v: string) => void;
  onStatusChange: (v: string) => void;
}

const selectClass =
  "h-9 w-full appearance-none rounded-sm border border-[#E5E7EB] bg-white px-3 pr-8 text-sm focus:border-(--repair-primary) focus:outline-none focus:ring-1 focus:ring-(--repair-primary)";

const inputClass =
  "h-9 w-full rounded-sm border border-[#E5E7EB] bg-white px-3 text-sm focus:border-(--repair-primary) focus:outline-none focus:ring-1 focus:ring-(--repair-primary)";

export function LeadSearchFilterPanel({
  customerName,
  leadId,
  status,
  onCustomerNameChange,
  onLeadIdChange,
  onStatusChange,
}: LeadSearchFilterPanelProps) {
  return (
    <section className="rounded-sm border border-[#E5E7EB] bg-white p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <label className="space-y-1">
          <span className="text-xs font-medium text-[#374151]">Customer Name</span>
          <input
            value={customerName}
            onChange={(e) => onCustomerNameChange(e.target.value)}
            placeholder="Customer Name"
            className={inputClass}
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs font-medium text-[#374151]">Lead ID</span>
          <input
            value={leadId}
            onChange={(e) => onLeadIdChange(e.target.value)}
            placeholder="Lead ID"
            className={inputClass}
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs font-medium text-[#374151]">Status</span>
          <div className="relative">
            <select value={status} onChange={(e) => onStatusChange(e.target.value)} className={selectClass}>
              <option value="">All</option>
              <option value="Won">Won</option>
              <option value="Lost">Lost</option>
              <option value="Open">Open</option>
              <option value="In progress">In progress</option>
              <option value="Expired">Expired</option>
              <option value="Canceled">Canceled</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-[#9CA3AF]" />
          </div>
        </label>
      </div>
    </section>
  );
}
