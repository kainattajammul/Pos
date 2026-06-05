export interface GoodsReceivedReviewData {
  adjustmentType: string;
  dateLabel: string;
  newOnHandQuantity: number;
  quantityFormula: string;
  averageCost: number;
  note: string;
}

export const DEFAULT_GOODS_RECEIVED_REVIEW: GoodsReceivedReviewData = {
  adjustmentType: "Increase Stock",
  dateLabel: "Jul 25, 2025 at 2:30 PM",
  newOnHandQuantity: 1,
  quantityFormula: "(1-1)",
  averageCost: 0,
  note: "add in stock",
};
