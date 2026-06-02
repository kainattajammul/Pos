export type EstimateLineType = "Service" | "Product" | "Part";

export interface EstimateLineItem {
  id: string;
  type: EstimateLineType | "";
  category: string;
  device: string;
  productService: string;
  description: string;
  notes: string;
  internalNotes: string;
  qty: number;
  price: number;
  taxClass: string;
  discount: number;
  discountReason: string;
}

export interface CreateEstimateFormState {
  estimateNumber: string;
  customerSearch: string;
  customerName: string;
  createdDate: string;
  dueDate: string;
  npoSo: string;
  slogan: string;
  footer: string;
  termsAndCondition: string;
  estimateDiscount: number;
  estimateDiscountReason: string;
  items: EstimateLineItem[];
}

export interface CreateEstimatePayload {
  estimateNumber: string;
  customer: { name: string; customerId: string | null };
  createdDate: string;
  dueDate: string;
  npoSo: string;
  slogan: string;
  footer: string;
  termsAndCondition: string;
  items: Array<{
    type: string;
    category: string;
    device: string;
    productService: string;
    description: string;
    notes: string;
    qty: number;
    price: number;
    taxClass: string;
    discount: number;
    internalNotes: string;
  }>;
  totals: { subTotal: number; discount: number; tax: number; total: number };
  attachments: string[];
}
