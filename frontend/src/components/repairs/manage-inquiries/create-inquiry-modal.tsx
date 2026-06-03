"use client";

import { forwardRef, useMemo, useRef, useState } from "react";
import { ChevronDown, CircleUserRound, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { InquiryRecord, InquiryStatus } from "@/components/repairs/manage-inquiries/manage-inquiries-types";

const MOCK_CUSTOMERS = [
  "Walkin Customer",
  "Soft Access",
  "John Smith",
  "Sarah Ahmed",
] as const;

type PhoneType = "Mobile" | "Work" | "Home";
type PhoneCountry = "UK" | "US";

interface CreateInquiryFormState {
  customerType: string;
  searchCustomer: string;
  firstName: string;
  lastName: string;
  phoneType: PhoneType;
  phoneCountry: PhoneCountry;
  phone: string;
  email: string;
  organization: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  postcode: string;
  country: string;
  reference: string;
  inquiryValue: string;
  assignedTo: string;
  inquiryStatus: "" | InquiryStatus;
  notes: string;
}

const DEFAULT_FORM: CreateInquiryFormState = {
  customerType: "Walkin Customer",
  searchCustomer: "",
  firstName: "",
  lastName: "",
  phoneType: "Mobile",
  phoneCountry: "UK",
  phone: "",
  email: "",
  organization: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  postcode: "",
  country: "United Kingdom",
  reference: "",
  inquiryValue: "",
  assignedTo: "",
  inquiryStatus: "",
  notes: "",
};

interface CreateInquiryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateInquiry: (inquiry: InquiryRecord, payload: unknown) => void;
}

interface CollapsibleSectionProps {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export function CollapsibleSection({
  title,
  open,
  onToggle,
  children,
}: CollapsibleSectionProps) {
  return (
    <section className="border-t border-[#E5E7EB]">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-2 py-2 text-left"
      >
        <span className="inline-flex size-5 items-center justify-center rounded-full bg-(--repair-primary) text-(--repair-on-primary)">
          <ChevronDown className={cn("size-3 transition-transform", open ? "rotate-180" : "")} />
        </span>
        <span className="text-lg font-semibold text-[#0F8B8D]">{title}</span>
      </button>
      {open ? <div className="pb-3">{children}</div> : null}
    </section>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="mb-1 block text-sm font-medium text-[#6B7280]">{children}</label>;
}

const BaseInput = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  (props, ref) => (
    <input
      ref={ref}
      {...props}
      className={cn(
        "h-11 w-full rounded-md border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:border-(--repair-primary) focus:outline-none focus:ring-1 focus:ring-(--repair-primary)",
        props.className,
      )}
    />
  ),
);
BaseInput.displayName = "BaseInput";

function AddressFields({
  form,
  setField,
}: {
  form: CreateInquiryFormState;
  setField: <K extends keyof CreateInquiryFormState>(key: K, value: CreateInquiryFormState[K]) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      <div>
        <FieldLabel>Address Line 1</FieldLabel>
        <BaseInput value={form.addressLine1} onChange={(e) => setField("addressLine1", e.target.value)} />
      </div>
      <div>
        <FieldLabel>Address Line 2</FieldLabel>
        <BaseInput value={form.addressLine2} onChange={(e) => setField("addressLine2", e.target.value)} />
      </div>
      <div>
        <FieldLabel>City</FieldLabel>
        <BaseInput value={form.city} onChange={(e) => setField("city", e.target.value)} />
      </div>
      <div>
        <FieldLabel>Postcode</FieldLabel>
        <BaseInput value={form.postcode} onChange={(e) => setField("postcode", e.target.value)} />
      </div>
      <div className="md:col-span-2">
        <FieldLabel>Country</FieldLabel>
        <BaseInput value={form.country} onChange={(e) => setField("country", e.target.value)} />
      </div>
    </div>
  );
}

function InquiryDetailsFields({
  form,
  setField,
}: {
  form: CreateInquiryFormState;
  setField: <K extends keyof CreateInquiryFormState>(key: K, value: CreateInquiryFormState[K]) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      <div>
        <FieldLabel>Reference</FieldLabel>
        <BaseInput value={form.reference} onChange={(e) => setField("reference", e.target.value)} />
      </div>
      <div>
        <FieldLabel>Inquiry Value</FieldLabel>
        <BaseInput
          value={form.inquiryValue}
          onChange={(e) => setField("inquiryValue", e.target.value)}
          placeholder="0.00"
          inputMode="decimal"
        />
      </div>
      <div>
        <FieldLabel>Assigned To</FieldLabel>
        <BaseInput value={form.assignedTo} onChange={(e) => setField("assignedTo", e.target.value)} />
      </div>
      <div>
        <FieldLabel>Inquiry Status</FieldLabel>
        <div className="relative">
          <select
            value={form.inquiryStatus}
            onChange={(e) => setField("inquiryStatus", e.target.value as "" | InquiryStatus)}
            className="h-11 w-full appearance-none rounded-md border border-[#E5E7EB] bg-white px-3 pr-9 text-sm text-[#111827] focus:border-(--repair-primary) focus:outline-none focus:ring-1 focus:ring-(--repair-primary)"
          >
            <option value="">Select status</option>
            <option value="New">New</option>
            <option value="Open">Open</option>
            <option value="Closed">Closed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[#9CA3AF]" />
        </div>
      </div>
      <div className="md:col-span-2">
        <FieldLabel>Notes</FieldLabel>
        <textarea
          value={form.notes}
          onChange={(e) => setField("notes", e.target.value)}
          className="h-24 w-full resize-none rounded-md border border-[#E5E7EB] px-3 py-2 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:border-(--repair-primary) focus:outline-none focus:ring-1 focus:ring-(--repair-primary)"
        />
      </div>
    </div>
  );
}

export function CreateInquiryModal({ open, onOpenChange, onCreateInquiry }: CreateInquiryModalProps) {
  const [form, setForm] = useState<CreateInquiryFormState>(DEFAULT_FORM);
  const [addressOpen, setAddressOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const firstNameRef = useRef<HTMLInputElement>(null);

  const filteredCustomers = useMemo(() => {
    const q = form.searchCustomer.trim().toLowerCase();
    if (!q) return [];
    return MOCK_CUSTOMERS.filter((c) => c.toLowerCase().includes(q));
  }, [form.searchCustomer]);

  const setField = <K extends keyof CreateInquiryFormState>(
    key: K,
    value: CreateInquiryFormState[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const reset = () => {
    setForm(DEFAULT_FORM);
    setAddressOpen(false);
    setDetailsOpen(false);
    setError(null);
  };

  const handleOpenChange = (next: boolean) => {
    onOpenChange(next);
    if (!next) reset();
  };

  const handleSubmit = () => {
    const hasCustomerName = form.firstName.trim().length > 0 || form.searchCustomer.trim().length > 0;
    const hasContact = form.phone.trim().length > 0 || form.email.trim().length > 0;
    const detailsStatusRequired = detailsOpen && !form.inquiryStatus;

    if (!hasCustomerName) {
      setError("First Name or Customer Name is required.");
      return;
    }
    if (!hasContact) {
      setError("Phone or Email is required.");
      return;
    }
    if (detailsStatusRequired) {
      setError("Inquiry Status is required when Inquiry Details is expanded.");
      return;
    }

    const fullName = `${form.firstName} ${form.lastName}`.trim();
    const customerName = fullName || form.searchCustomer || form.customerType;
    const createdDate = new Date().toISOString().slice(0, 10);
    const status: InquiryStatus = form.inquiryStatus || "New";
    const nextId = `INQ-${Date.now().toString().slice(-4)}`;
    const ticketId = form.reference.replace(/[^\d]/g, "").slice(0, 5) || "00000";
    const valueNum = Number.parseFloat(form.inquiryValue || "0");

    const payload = {
      customerType: form.customerType,
      firstName: form.firstName,
      lastName: form.lastName,
      phoneType: form.phoneType,
      phoneCountry: form.phoneCountry,
      phone: form.phone,
      email: form.email,
      organization: form.organization,
      address: {
        addressLine1: form.addressLine1,
        addressLine2: form.addressLine2,
        city: form.city,
        postcode: form.postcode,
        country: form.country,
      },
      inquiry: {
        reference: form.reference,
        inquiryValue: valueNum,
        assignedTo: form.assignedTo,
        status,
        notes: form.notes,
      },
    };

    console.log("create-inquiry-payload", payload);

    const newInquiry: InquiryRecord = {
      id: nextId,
      inquiryId: nextId,
      customerName,
      reference: form.reference || `Ticket ID ${ticketId}`,
      inquiryValue: Number.isFinite(valueNum) ? valueNum : 0,
      assignedTo: form.assignedTo || "Unassigned",
      createdDate,
      status,
      ticketId,
    };

    onCreateInquiry(newInquiry, payload);
    handleOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-black/25"
        className="h-[88vh] w-[96vw] max-w-[1180px] gap-0 overflow-hidden rounded-sm border border-[#E5E7EB] bg-white p-0 shadow-2xl sm:max-w-[96vw]"
      >
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-4 py-3">
          <DialogTitle className="text-base font-semibold text-[#374151]">Create Inquiry</DialogTitle>
          <button
            type="button"
            onClick={() => handleOpenChange(false)}
            className="rounded p-1 text-[#9CA3AF] transition-colors hover:bg-[#F3F4F6] hover:text-[#6B7280]"
            aria-label="Close create inquiry dialog"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="border-b border-[#E5E7EB] bg-[#F3F4F6] p-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_420px] md:items-center">
              <div className="flex items-center gap-3">
                <span className="inline-flex size-12 items-center justify-center rounded-full bg-[#E5E7EB] text-[#9CA3AF]">
                  <CircleUserRound className="size-7" />
                </span>
                <p className="text-3xl font-semibold text-[#1F2937]">{form.customerType}</p>
              </div>
              <div className="relative flex items-center gap-2">
                <BaseInput
                  value={form.searchCustomer}
                  onChange={(e) => setField("searchCustomer", e.target.value)}
                  placeholder="Search Customer"
                />
                <Button
                  type="button"
                  size="icon"
                  className="size-11 rounded-md border-0 bg-(--repair-primary) text-(--repair-on-primary) hover:opacity-90"
                  onClick={() => firstNameRef.current?.focus()}
                >
                  <Plus className="size-5" />
                </Button>
                {filteredCustomers.length > 0 ? (
                  <div className="absolute top-[46px] left-0 right-14 z-10 rounded-md border border-[#E5E7EB] bg-white shadow-lg">
                    {filteredCustomers.map((name) => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => {
                          setField("searchCustomer", name);
                          const parts = name.split(" ");
                          setField("firstName", parts[0] ?? "");
                          setField("lastName", parts.slice(1).join(" "));
                        }}
                        className="block w-full px-3 py-2 text-left text-sm text-[#374151] hover:bg-[#F3F4F6]"
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="space-y-3 p-4">
            <div className="grid grid-cols-1 gap-x-6 gap-y-3 md:grid-cols-2">
              <div>
                <FieldLabel>First Name</FieldLabel>
                <BaseInput
                  ref={firstNameRef}
                  value={form.firstName}
                  onChange={(e) => setField("firstName", e.target.value)}
                />
              </div>
              <div>
                <FieldLabel>Last Name</FieldLabel>
                <BaseInput value={form.lastName} onChange={(e) => setField("lastName", e.target.value)} />
              </div>

              <div>
                <FieldLabel>Phone</FieldLabel>
                <div className="grid grid-cols-[112px_88px_1fr] gap-2">
                  <div className="relative">
                    <select
                      value={form.phoneType}
                      onChange={(e) => setField("phoneType", e.target.value as PhoneType)}
                      className="h-11 w-full appearance-none rounded-md border border-[#E5E7EB] bg-white px-3 pr-8 text-sm text-[#111827] focus:border-(--repair-primary) focus:outline-none focus:ring-1 focus:ring-(--repair-primary)"
                    >
                      <option value="Mobile">Mobile</option>
                      <option value="Work">Work</option>
                      <option value="Home">Home</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-4 -translate-y-1/2 text-[#9CA3AF]" />
                  </div>
                  <div className="relative">
                    <select
                      value={form.phoneCountry}
                      onChange={(e) => setField("phoneCountry", e.target.value as PhoneCountry)}
                      className="h-11 w-full appearance-none rounded-md border border-[#E5E7EB] bg-white px-2 pr-7 text-sm text-[#111827] focus:border-(--repair-primary) focus:outline-none focus:ring-1 focus:ring-(--repair-primary)"
                    >
                      <option value="UK">🇬🇧 UK</option>
                      <option value="US">🇺🇸 US</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 size-4 -translate-y-1/2 text-[#9CA3AF]" />
                  </div>
                  <BaseInput
                    value={form.phone}
                    onChange={(e) => setField("phone", e.target.value)}
                    placeholder="Enter mobile"
                  />
                </div>
              </div>
              <div>
                <FieldLabel>Email</FieldLabel>
                <BaseInput value={form.email} onChange={(e) => setField("email", e.target.value)} />
              </div>

              <div>
                <FieldLabel>Organization</FieldLabel>
                <BaseInput value={form.organization} onChange={(e) => setField("organization", e.target.value)} />
              </div>
              <div />
            </div>

            <CollapsibleSection
              title="Add Address"
              open={addressOpen}
              onToggle={() => setAddressOpen((v) => !v)}
            >
              <AddressFields form={form} setField={setField} />
            </CollapsibleSection>

            <CollapsibleSection
              title="Inquiry Details"
              open={detailsOpen}
              onToggle={() => setDetailsOpen((v) => !v)}
            >
              <InquiryDetailsFields form={form} setField={setField} />
            </CollapsibleSection>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-[#E5E7EB] px-4 py-3">
          <p className="text-sm text-[#DC2626]">{error ?? ""}</p>
          <Button
            type="button"
            onClick={handleSubmit}
            className="h-11 rounded-md border-0 bg-(--repair-primary) px-6 text-lg font-semibold text-(--repair-on-primary) hover:opacity-90"
          >
            Create Inquiry
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
