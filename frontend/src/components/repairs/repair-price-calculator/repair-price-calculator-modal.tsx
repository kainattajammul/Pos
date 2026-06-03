"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CalculatorSearchSection } from "@/components/repairs/repair-price-calculator/calculator-search-section";
import { PricingGuidelinesCard } from "@/components/repairs/repair-price-calculator/pricing-guidelines-card";
import { CalculatorTotalBox } from "@/components/repairs/repair-price-calculator/calculator-total-box";
import {
  DEFAULT_CALCULATOR_FORM,
  type CalculatorFormState,
} from "@/components/repairs/repair-price-calculator/repair-price-calculator-types";
import {
  buildCalculatorPayload,
  calculateRepairPrice,
} from "@/components/repairs/repair-price-calculator/repair-price-calculator-utils";

interface RepairPriceCalculatorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RepairPriceCalculatorModal({
  open,
  onOpenChange,
}: RepairPriceCalculatorModalProps) {
  const [form, setForm] = useState<CalculatorFormState>(DEFAULT_CALCULATOR_FORM);
  const [totalWithTax, setTotalWithTax] = useState(0);
  const [totalWithoutTax, setTotalWithoutTax] = useState(0);

  const handleReset = () => {
    setForm(DEFAULT_CALCULATOR_FORM);
    setTotalWithTax(0);
    setTotalWithoutTax(0);
  };

  const handleCalculate = () => {
    const result = calculateRepairPrice(form);
    setTotalWithTax(result.totalWithTax);
    setTotalWithoutTax(result.totalWithoutTax);
    const payload = buildCalculatorPayload(form, result);
    console.log("Repair price calculator payload:", payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[90vh] max-w-2xl gap-0 overflow-y-auto p-0 sm:max-w-2xl"
        showCloseButton
      >
        <DialogHeader className="border-b border-[#E5E7EB] px-5 pb-4 pt-5">
          <DialogTitle className="text-xl font-semibold text-[#111827]">
            Repair Price Calculator v1.1
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed text-[#6B7280]">
            Use our repair price calculator when quoting for an unusual phone or computer that
            does not have consistent profit margins and clear pricing. Fill out the form below to
            get an estimated repair cost.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-5 py-4">
          <CalculatorSearchSection
            searchType={form.searchType}
            store={form.store}
            searchQuery={form.searchQuery}
            onSearchTypeChange={(searchType) => setForm((f) => ({ ...f, searchType }))}
            onStoreChange={(store) => setForm((f) => ({ ...f, store }))}
            onSearchQueryChange={(searchQuery) => setForm((f) => ({ ...f, searchQuery }))}
          />

          <PricingGuidelinesCard
            form={form}
            onChange={setForm}
            onReset={handleReset}
            onCalculate={handleCalculate}
          />

          <CalculatorTotalBox
            totalWithTax={totalWithTax}
            totalWithoutTax={totalWithoutTax}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
