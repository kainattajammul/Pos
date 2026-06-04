import { apiClient } from "@/lib/axios";
import {
  MOCK_PURCHASE_ORDERS,
  type PurchaseOrderRecord,
} from "@/components/inventory/purchase-orders/purchase-order-types";
import type { ApiSuccessResponse } from "@/types/api";

export interface ApiPurchaseOrder {
  id: number;
  orderId: string;
  date: string;
  product: string;
  createdBy: string;
  specialOrder: string | null;
  paymentStatus: PurchaseOrderRecord["paymentStatus"];
  supplier: string;
  trackingId: string | null;
  totalValue: number;
  amountPayable: number;
  status: PurchaseOrderRecord["status"];
}

function mapApiToRecord(row: ApiPurchaseOrder): PurchaseOrderRecord {
  return {
    id: String(row.id),
    orderId: row.orderId,
    date: row.date,
    product: row.product,
    createdBy: row.createdBy,
    specialOrder: row.specialOrder ?? "",
    paymentStatus: row.paymentStatus,
    supplier: row.supplier,
    trackingId: row.trackingId ?? "",
    totalValue: row.totalValue,
    amountPayable: row.amountPayable,
    status: row.status,
  };
}

export async function fetchPurchaseOrders(
  shopId: number,
): Promise<PurchaseOrderRecord[]> {
  try {
    const { data } = await apiClient.get<ApiSuccessResponse<ApiPurchaseOrder[]>>(
      "/purchase-orders",
      { params: { shopId } },
    );
    return data.data?.map(mapApiToRecord) ?? MOCK_PURCHASE_ORDERS;
  } catch {
    return MOCK_PURCHASE_ORDERS;
  }
}

export function exportPurchaseOrdersCsv(rows: PurchaseOrderRecord[]) {
  const headers = [
    "ID",
    "Date",
    "Product",
    "Created By",
    "Special Order",
    "Payment Status",
    "Supplier",
    "Tracking ID",
    "Total Value",
    "Amount Payable",
  ];
  const escape = (v: string | number) => {
    const str = String(v);
    return str.includes(",") ? `"${str.replace(/"/g, '""')}"` : str;
  };
  const lines = [
    headers.join(","),
    ...rows.map((r) =>
      [
        r.orderId,
        r.date,
        r.product,
        r.createdBy,
        r.specialOrder,
        r.paymentStatus,
        r.supplier,
        r.trackingId,
        r.totalValue,
        r.amountPayable,
      ]
        .map(escape)
        .join(","),
    ),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "purchase-orders.csv";
  anchor.click();
  URL.revokeObjectURL(url);
}
