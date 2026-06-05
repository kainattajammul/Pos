"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DEFAULT_BILL_PAYMENT_FORM,
  type BillPaymentFormValues,
  type BillPaymentRecord,
} from "@/components/inventory/bill-payments/bill-payments-types";

interface BillPaymentsFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit";
  initial?: BillPaymentRecord | null;
  isSubmitting?: boolean;
  onSave: (values: BillPaymentFormValues) => void;
}

const inputClass =
  "h-9 w-full rounded-sm border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] focus:border-(--repair-primary) focus:outline-none focus:ring-1 focus:ring-(--repair-primary)";

function recordToForm(record: BillPaymentRecord): BillPaymentFormValues {
  return {
    planName: record.planName,
    providerName: record.providerName,
    networkName: record.networkName,
    planMsrp: String(record.planMsrp),
    airtimeMargin: String(record.airtimeMargin),
    unitCost: String(record.unitCost),
    collectFee: String(record.collectFee),
    tax911: String(record.tax911),
  };
}

export function BillPaymentsFormDialog({
  open,
  onOpenChange,
  mode,
  initial,
  isSubmitting,
  onSave,
}: BillPaymentsFormDialogProps) {
  const defaults =
    mode === "edit" && initial ? recordToForm(initial) : DEFAULT_BILL_PAYMENT_FORM;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg border border-[#E5E7EB] bg-white">
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Add Bill Payment Item" : "Edit Bill Payment Item"}
          </DialogTitle>
        </DialogHeader>
        <form
          key={`${mode}-${initial?.id ?? "new"}`}
          id="bill-payment-form"
          className="grid gap-3 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            onSave({
              planName: String(fd.get("planName") ?? ""),
              providerName: String(fd.get("providerName") ?? ""),
              networkName: String(fd.get("networkName") ?? ""),
              planMsrp: String(fd.get("planMsrp") ?? ""),
              airtimeMargin: String(fd.get("airtimeMargin") ?? ""),
              unitCost: String(fd.get("unitCost") ?? ""),
              collectFee: String(fd.get("collectFee") ?? ""),
              tax911: String(fd.get("tax911") ?? ""),
            });
          }}
        >
          <label className="space-y-1 sm:col-span-2">
            <span className="text-xs font-medium text-[#374151]">Plan Name</span>
            <input name="planName" defaultValue={defaults.planName} required className={inputClass} />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-medium text-[#374151]">Provider Name</span>
            <input
              name="providerName"
              defaultValue={defaults.providerName}
              required
              className={inputClass}
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-medium text-[#374151]">Network Name</span>
            <input
              name="networkName"
              defaultValue={defaults.networkName}
              required
              className={inputClass}
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-medium text-[#374151]">Plan MSRP</span>
            <input
              name="planMsrp"
              type="number"
              step="0.01"
              min="0"
              defaultValue={defaults.planMsrp}
              className={inputClass}
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-medium text-[#374151]">Airtime Margin</span>
            <input
              name="airtimeMargin"
              type="number"
              step="0.01"
              min="0"
              defaultValue={defaults.airtimeMargin}
              className={inputClass}
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-medium text-[#374151]">Unit Cost</span>
            <input
              name="unitCost"
              type="number"
              step="0.01"
              min="0"
              defaultValue={defaults.unitCost}
              className={inputClass}
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-medium text-[#374151]">Collect Fee</span>
            <input
              name="collectFee"
              type="number"
              step="0.01"
              min="0"
              defaultValue={defaults.collectFee}
              className={inputClass}
            />
          </label>
          <label className="space-y-1 sm:col-span-2">
            <span className="text-xs font-medium text-[#374151]">911 Tax</span>
            <input
              name="tax911"
              type="number"
              step="0.01"
              min="0"
              defaultValue={defaults.tax911}
              className={inputClass}
            />
          </label>
        </form>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            className="rounded-sm border-[#E5E7EB]"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="bill-payment-form"
            className="rounded-sm border-0 bg-(--repair-primary) text-(--repair-on-primary) hover:opacity-90"
            disabled={isSubmitting}
          >
            {mode === "add" ? "Add Item" : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
