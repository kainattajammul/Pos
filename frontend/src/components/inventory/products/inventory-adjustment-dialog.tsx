"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { InventoryProduct } from "@/types/inventory-product";
import { formatCurrency } from "@/utils/format";

type AdjustmentType = "increase" | "decrease";

interface InventoryAdjustmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: InventoryProduct | null;
  onSubmit: (payload: {
    productId: string;
    adjustmentType: AdjustmentType;
    adjustmentQuantity: number;
    costPrice: number;
    newOnHandQuantity: number;
    notes: string;
  }) => void;
}

function formatAdjustmentDate(date: Date) {
  const formatted = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
  return formatted.replace("AM", "am").replace("PM", "pm");
}

const inputClass = "h-10 border-neutral-200 bg-white text-sm shadow-sm";

export function InventoryAdjustmentDialog({
  open,
  onOpenChange,
  product,
  onSubmit,
}: InventoryAdjustmentDialogProps) {
  const qtyRef = useRef<HTMLInputElement>(null);
  const [adjustmentType, setAdjustmentType] = useState<AdjustmentType>("increase");
  const [adjustmentQuantity, setAdjustmentQuantity] = useState<string>("");
  const [costPrice, setCostPrice] = useState<string>("0");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string>("");
  const [dateValue, setDateValue] = useState("");

  const onHand = product?.stock ?? 0;
  const adjustmentQtyNum = Number(adjustmentQuantity || 0);
  const costPriceNum = Number(costPrice || 0);
  const signedQty = adjustmentType === "increase" ? adjustmentQtyNum : -adjustmentQtyNum;
  const newOnHandQuantity = onHand + signedQty;
  const adjustmentValue = adjustmentQtyNum * costPriceNum;

  useEffect(() => {
    if (!open || !product) return;
    setAdjustmentType("increase");
    setAdjustmentQuantity("");
    setCostPrice(String(product.costPrice));
    setNotes("");
    setError("");
    setDateValue(formatAdjustmentDate(new Date()));
    const id = window.setTimeout(() => qtyRef.current?.focus(), 10);
    return () => window.clearTimeout(id);
  }, [open, product]);

  const canReview = useMemo(() => {
    return adjustmentQuantity.trim().length > 0;
  }, [adjustmentQuantity]);

  const handleReview = () => {
    if (!product) return;
    if (!Number.isFinite(adjustmentQtyNum) || adjustmentQtyNum <= 0) {
      setError("Adjustment Quantity is required and must be greater than 0.");
      return;
    }
    if (!Number.isFinite(costPriceNum) || costPriceNum < 0) {
      setError("Cost Price must be greater than or equal to 0.");
      return;
    }
    if (adjustmentType === "decrease" && newOnHandQuantity < 0) {
      setError("Decrease quantity is invalid. New On Hand Quantity cannot be below 0.");
      return;
    }
    setError("");
    onSubmit({
      productId: product.id,
      adjustmentType,
      adjustmentQuantity: adjustmentQtyNum,
      costPrice: costPriceNum,
      newOnHandQuantity,
      notes: notes.trim(),
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="gap-0 rounded-xl bg-white p-0 sm:max-w-[520px]"
        overlayClassName="bg-black/55"
      >
        <div className="border-b border-neutral-200 px-5 py-4">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-neutral-900">
              Inventory Adjustment
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="space-y-4 px-5 py-4">
          <div className="space-y-2">
            <Label>Adjustment Type</Label>
            <Select
              value={adjustmentType}
              onValueChange={(value) => setAdjustmentType(value as AdjustmentType)}
            >
              <SelectTrigger className={inputClass}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="increase">Increase Stock</SelectItem>
                <SelectItem value="decrease">Decrease Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Date</Label>
            <Input value={dateValue} readOnly className={inputClass} />
          </div>

          <div className="space-y-2">
            <Label>On-Hand Quantity</Label>
            <Input value={String(onHand)} readOnly className={inputClass} />
          </div>

          <div className="space-y-2">
            <Label>
              Adjustment Quantity <span className="text-destructive">*</span>
            </Label>
            <Input
              ref={qtyRef}
              type="number"
              min="0"
              step="1"
              value={adjustmentQuantity}
              onChange={(e) => setAdjustmentQuantity(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="space-y-2">
            <Label>Cost Price</Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={costPrice}
              onChange={(e) => setCostPrice(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="space-y-2">
            <Label>New On Hand Quantity</Label>
            <Input value={String(Number.isFinite(newOnHandQuantity) ? newOnHandQuantity : 0)} readOnly className={inputClass} />
          </div>

          <p className="text-sm font-semibold text-emerald-600">
            Adjustment Value = {formatCurrency(Number.isFinite(adjustmentValue) ? adjustmentValue : 0)}
          </p>

          <div className="space-y-2">
            <Label>Notes</Label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Write here..."
              rows={4}
              className="w-full resize-none rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>

        <div className="flex justify-end gap-2 border-t border-neutral-200 px-5 py-3">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!canReview}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={handleReview}
          >
            Review Adjustment
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

