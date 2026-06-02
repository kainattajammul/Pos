"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CloudUpload } from "lucide-react";
import { RepairsTopNav } from "@/components/repairs/repairs-top-nav";
import { Button } from "@/components/ui/button";
import { EstimateHeader } from "@/components/repairs/manage-estimates/estimate-header";
import { EstimateCustomerSection } from "@/components/repairs/manage-estimates/estimate-customer-section";
import { EstimateMetaSection } from "@/components/repairs/manage-estimates/estimate-meta-section";
import { EstimateTextSection } from "@/components/repairs/manage-estimates/estimate-text-section";
import { EstimateItemsTable } from "@/components/repairs/manage-estimates/estimate-items-table";
import { EstimateTotalsPanel } from "@/components/repairs/manage-estimates/estimate-totals-panel";
import { EstimateAttachmentsSection } from "@/components/repairs/manage-estimates/estimate-attachments-section";
import type {
  CreateEstimatePayload,
  EstimateLineItem,
} from "@/components/repairs/manage-estimates/create-estimate-types";
import {
  calculateTotals,
  createEmptyLineItem,
  formatEstimateDate,
  formatEstimateDateTime,
  allocateEstimateNumber,
  NEW_ESTIMATES_STORAGE_KEY,
} from "@/components/repairs/manage-estimates/create-estimate-utils";
import type { EstimateRecord } from "@/components/repairs/manage-estimates/manage-estimates-types";

function payloadToRecord(payload: CreateEstimatePayload): EstimateRecord {
  return {
    id: `EST-${payload.estimateNumber}`,
    productService: payload.items[0]?.productService || payload.items[0]?.description || "—",
    customer: payload.customer.name,
    customerEmail: "",
    ticketLeadReference: payload.npoSo || "—",
    createdDate: new Date().toISOString().slice(0, 10),
    total: payload.totals.total,
    status: "Draft",
  };
}

function validateForm(
  customerName: string,
  items: EstimateLineItem[],
): string | null {
  if (!customerName.trim()) {
    return "Please select a customer or use Walkin Customer.";
  }
  if (items.length === 0) {
    return "Add at least one estimate line item.";
  }
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const row = i + 1;
    if (!item.type) {
      return `Row ${row}: select a type.`;
    }
    if (!item.productService.trim() && !item.description.trim()) {
      return `Row ${row}: provide Product/Service or Description.`;
    }
    if (item.qty > 0 && item.price < 0) {
      return `Row ${row}: price must be a valid number.`;
    }
    if (item.qty <= 0 && (item.price > 0 || item.productService || item.description)) {
      return `Row ${row}: quantity must be greater than 0.`;
    }
  }
  return null;
}

export function CreateEstimatePage() {
  const router = useRouter();
  const [estimateNumber, setEstimateNumber] = useState("001");
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerName, setCustomerName] = useState("Walkin Customer");
  const [createdDate, setCreatedDate] = useState(() => formatEstimateDateTime());
  const [dueDate, setDueDate] = useState(() => formatEstimateDate());
  const [npoSo, setNpoSo] = useState("");
  const [slogan, setSlogan] = useState("");
  const [footer, setFooter] = useState("");
  const [termsAndCondition, setTermsAndCondition] = useState("");
  const [estimateDiscount, setEstimateDiscount] = useState(0);
  const [estimateDiscountReason, setEstimateDiscountReason] = useState("");
  const [items, setItems] = useState<EstimateLineItem[]>(() => [createEmptyLineItem()]);
  const [attachmentsOpen, setAttachmentsOpen] = useState(false);
  const [attachmentNames, setAttachmentNames] = useState<string[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const totals = useMemo(
    () => calculateTotals(items, estimateDiscount),
    [items, estimateDiscount],
  );

  useEffect(() => {
    setEstimateNumber(allocateEstimateNumber());
  }, []);

  const handleSubmit = () => {
    const name = customerName.trim() || "Walkin Customer";
    const error = validateForm(name, items);
    if (error) {
      setSubmitError(error);
      return;
    }
    setSubmitError(null);

    const payload: CreateEstimatePayload = {
      estimateNumber,
      customer: { name, customerId: null },
      createdDate,
      dueDate,
      npoSo,
      slogan,
      footer,
      termsAndCondition,
      items: items.map((item) => ({
        type: item.type,
        category: item.category,
        device: item.device,
        productService: item.productService,
        description: item.description,
        notes: item.notes,
        qty: item.qty,
        price: item.price,
        taxClass: item.taxClass,
        discount: item.discount,
        internalNotes: item.internalNotes,
      })),
      totals,
      attachments: attachmentNames,
    };

    console.log("Create estimate payload:", payload);

    try {
      const raw = sessionStorage.getItem(NEW_ESTIMATES_STORAGE_KEY);
      const existing = raw ? (JSON.parse(raw) as EstimateRecord[]) : [];
      const next = Array.isArray(existing) ? existing : [];
      next.push(payloadToRecord(payload));
      sessionStorage.setItem(NEW_ESTIMATES_STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore storage errors */
    }

    router.push("/repairs/manage-estimates");
  };

  return (
    <div className="repairs-pos-theme flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-white">
      <RepairsTopNav />
      <div className="min-h-0 flex-1 overflow-auto">
        <div className="mx-auto w-full max-w-[1600px] px-4 py-4 md:px-5 md:py-5">
          <EstimateHeader
            estimateNumber={estimateNumber}
            onEditNumber={() => {
              const next = window.prompt("Estimate number", estimateNumber);
              if (next?.trim()) setEstimateNumber(next.trim().padStart(3, "0"));
            }}
          />

          <div className="grid grid-cols-1 gap-6 border-b border-[#E5E7EB] pb-6 lg:grid-cols-3">
            <EstimateCustomerSection
              search={customerSearch}
              customerName={customerName}
              onSearchChange={setCustomerSearch}
              onSelectCustomer={(name) => {
                setCustomerName(name);
                setCustomerSearch(name);
              }}
              onNewCustomer={() => {
                window.alert("Create Customer flow will be connected here.");
              }}
            />
            <EstimateMetaSection
              createdDate={createdDate}
              dueDate={dueDate}
              npoSo={npoSo}
              onCreatedDateChange={setCreatedDate}
              onDueDateChange={setDueDate}
              onNpoSoChange={setNpoSo}
            />
            <EstimateTextSection
              slogan={slogan}
              footer={footer}
              termsAndCondition={termsAndCondition}
              onSloganChange={setSlogan}
              onFooterChange={setFooter}
              onTermsChange={setTermsAndCondition}
            />
          </div>

          <EstimateItemsTable items={items} onChange={setItems} />

          <div className="mt-4 flex flex-col gap-4">
            <EstimateTotalsPanel
              subTotal={totals.subTotal}
              tax={totals.tax}
              total={totals.total}
              estimateDiscount={estimateDiscount}
              onEstimateDiscountChange={setEstimateDiscount}
              onAddDiscountReason={() => {
                const reason = window.prompt("Discount reason", estimateDiscountReason);
                if (reason !== null) setEstimateDiscountReason(reason);
              }}
            />
          </div>

          <EstimateAttachmentsSection
            open={attachmentsOpen}
            onToggle={() => setAttachmentsOpen((v) => !v)}
            fileNames={attachmentNames}
            onFilesSelected={(files) => {
              if (!files) return;
              setAttachmentNames(Array.from(files).map((f) => f.name));
            }}
          />

          {submitError ? (
            <p className="mt-4 text-sm text-red-600" role="alert">
              {submitError}
            </p>
          ) : null}

          <div className="mt-6 flex justify-end pb-8">
            <Button
              type="button"
              onClick={handleSubmit}
              className="h-11 rounded-md border-0 bg-(--repair-primary) px-6 text-base font-semibold text-(--repair-on-primary) hover:opacity-90"
            >
              Create Estimate
              <CloudUpload className="size-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
