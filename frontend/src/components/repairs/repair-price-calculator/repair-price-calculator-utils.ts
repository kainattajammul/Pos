import type {
  CalculatorFormState,
  CalculatorPayload,
  CalculatorResult,
} from "@/components/repairs/repair-price-calculator/repair-price-calculator-types";

const TAX_RATES: Record<string, number> = {
  "Local (6%)": 0.06,
  "Standard (20%)": 0.2,
  "Reduced (5%)": 0.05,
};

function parseTaxRate(label: string): number {
  if (!label || label === "Tax Class 2") return 0;
  if (TAX_RATES[label] !== undefined) return TAX_RATES[label];
  const match = label.match(/(\d+(?:\.\d+)?)\s*%/);
  return match ? Number.parseFloat(match[1]) / 100 : 0;
}

export { formatCurrency } from "@/utils/format";

export function calculateRepairPrice(form: CalculatorFormState): CalculatorResult {
  const cost = Number.parseFloat(form.cost) || 0;
  const markupVal = Number.parseFloat(form.markupValue) || 0;
  const labourVal = Number.parseFloat(form.labourValue) || 0;

  const markupAmount =
    form.markupType === "%" ? cost * (markupVal / 100) : markupVal;
  const labourAmount = form.labourType === "Fixed" ? labourVal : labourVal;

  const subtotal = cost + markupAmount + labourAmount;
  const rate1 = parseTaxRate(form.taxClass);
  const rate2 = parseTaxRate(form.taxClass2);
  const combinedRate = rate1 + rate2;

  if (form.taxType === "Inclusive") {
    const totalWithTax = subtotal;
    const totalWithoutTax =
      combinedRate > 0 ? subtotal / (1 + combinedRate) : subtotal;
    return { totalWithTax, totalWithoutTax };
  }

  const tax = subtotal * combinedRate;
  return {
    totalWithoutTax: subtotal,
    totalWithTax: subtotal + tax,
  };
}

export function buildCalculatorPayload(
  form: CalculatorFormState,
  result: CalculatorResult,
): CalculatorPayload {
  return {
    selectedSearchType: form.searchType,
    selectedStore: form.store,
    searchQuery: form.searchQuery,
    cost: Number.parseFloat(form.cost) || 0,
    markup: {
      value: Number.parseFloat(form.markupValue) || 0,
      type: form.markupType,
    },
    labourRate: {
      value: Number.parseFloat(form.labourValue) || 0,
      type: form.labourType,
    },
    taxClass: form.taxClass,
    taxClass2: form.taxClass2,
    taxType: form.taxType,
    totalWithTax: result.totalWithTax,
    totalWithoutTax: result.totalWithoutTax,
  };
}
