export type SearchType = "Name" | "SKU";

export type MarkupType = "%" | "Fixed";
export type LabourType = "Fixed" | "Hourly";
export type TaxMode = "Exclusive" | "Inclusive";

export interface CalculatorFormState {
  searchType: SearchType;
  store: string;
  searchQuery: string;
  cost: string;
  markupValue: string;
  markupType: MarkupType;
  labourValue: string;
  labourType: LabourType;
  taxClass: string;
  taxClass2: string;
  taxType: TaxMode;
}

export interface CalculatorResult {
  totalWithTax: number;
  totalWithoutTax: number;
}

export interface CalculatorPayload {
  selectedSearchType: SearchType;
  selectedStore: string;
  searchQuery: string;
  cost: number;
  markup: { value: number; type: MarkupType };
  labourRate: { value: number; type: LabourType };
  taxClass: string;
  taxClass2: string;
  taxType: TaxMode;
  totalWithTax: number;
  totalWithoutTax: number;
}

export const DEFAULT_CALCULATOR_FORM: CalculatorFormState = {
  searchType: "Name",
  store: "MS",
  searchQuery: "",
  cost: "",
  markupValue: "35",
  markupType: "%",
  labourValue: "80",
  labourType: "Fixed",
  taxClass: "Local (6%)",
  taxClass2: "",
  taxType: "Exclusive",
};
