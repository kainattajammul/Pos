"use client";

import { useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  INVENTORY_PRODUCT_FORM_DEFAULTS,
  inventoryProductFormSchema,
  mapProductToFormValues,
  productStockStatuses,
  type InventoryProductFormValues,
} from "@/lib/inventory-product-form";
import { PRODUCT_CATEGORIES, PRODUCT_TYPES } from "@/lib/inventory-products-demo-data";
import { cn } from "@/lib/utils";
import type { InventoryProduct } from "@/types/inventory-product";

const inputClass =
  "h-10 border-neutral-200 bg-white text-sm shadow-sm placeholder:text-neutral-400";

const selectClass =
  "h-10 w-full border-neutral-200 bg-white text-sm shadow-sm focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary";

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit" | "view";
  product: InventoryProduct | null;
  isSubmitting?: boolean;
  onSave: (values: InventoryProductFormValues) => void;
}

export function ProductFormDialog({
  open,
  onOpenChange,
  mode,
  product,
  isSubmitting = false,
  onSave,
}: ProductFormDialogProps) {
  const readOnly = mode === "view";

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<InventoryProductFormValues>({
    resolver: zodResolver(inventoryProductFormSchema) as Resolver<InventoryProductFormValues>,
    defaultValues: INVENTORY_PRODUCT_FORM_DEFAULTS,
  });

  const category = watch("category");
  const productType = watch("productType");
  const status = watch("status");

  useEffect(() => {
    if (!open) return;
    if ((mode === "edit" || mode === "view") && product) {
      reset(mapProductToFormValues(product));
    } else {
      reset(INVENTORY_PRODUCT_FORM_DEFAULTS);
    }
  }, [open, mode, product, reset]);

  const title =
    mode === "add" ? "Add Product" : mode === "edit" ? "Edit Product" : "View Product";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[min(92vh,720px)] gap-0 overflow-y-auto p-0 sm:max-w-2xl"
        showCloseButton
      >
        <div className="border-b border-border/60 px-4 py-4 sm:px-5">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
          </DialogHeader>
        </div>

        <form
          className="flex flex-col gap-4 px-4 py-4 sm:px-5"
          onSubmit={handleSubmit((values) => onSave(values))}
          noValidate
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="product-name">
                Product Name <span className="text-primary">*</span>
              </Label>
              <Input
                id="product-name"
                className={inputClass}
                disabled={isSubmitting || readOnly}
                {...register("name")}
              />
              {errors.name ? (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="product-sku">
                SKU <span className="text-primary">*</span>
              </Label>
              <Input
                id="product-sku"
                className={inputClass}
                disabled={isSubmitting || readOnly}
                {...register("sku")}
              />
              {errors.sku ? (
                <p className="text-xs text-destructive">{errors.sku.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="product-barcode">Barcode</Label>
              <Input
                id="product-barcode"
                className={inputClass}
                disabled={isSubmitting || readOnly}
                {...register("barcode")}
              />
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={category}
                onValueChange={(v) => setValue("category", v ?? "Phones")}
                disabled={isSubmitting || readOnly}
              >
                <SelectTrigger className={selectClass}>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCT_CATEGORIES.filter((c) => c !== "All").map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="product-brand">Brand</Label>
              <Input
                id="product-brand"
                className={inputClass}
                disabled={isSubmitting || readOnly}
                {...register("brand")}
              />
            </div>

            <div className="space-y-2">
              <Label>Product Type</Label>
              <Select
                value={productType}
                onValueChange={(v) => setValue("productType", v ?? "Device")}
                disabled={isSubmitting || readOnly}
              >
                <SelectTrigger className={selectClass}>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCT_TYPES.filter((t) => t !== "All").map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={status}
                onValueChange={(v) =>
                  setValue("status", (v ?? "In Stock") as InventoryProductFormValues["status"])
                }
                disabled={isSubmitting || readOnly}
              >
                <SelectTrigger className={selectClass}>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {productStockStatuses.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost-price">
                Cost Price <span className="text-primary">*</span>
              </Label>
              <Input
                id="cost-price"
                type="number"
                step="0.01"
                min="0"
                className={inputClass}
                disabled={isSubmitting || readOnly}
                {...register("costPrice")}
              />
              {errors.costPrice ? (
                <p className="text-xs text-destructive">{errors.costPrice.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sale-price">
                Sale Price <span className="text-primary">*</span>
              </Label>
              <Input
                id="sale-price"
                type="number"
                step="0.01"
                min="0"
                className={inputClass}
                disabled={isSubmitting || readOnly}
                {...register("salePrice")}
              />
              {errors.salePrice ? (
                <p className="text-xs text-destructive">{errors.salePrice.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">
                Quantity <span className="text-primary">*</span>
              </Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                step="1"
                className={inputClass}
                disabled={isSubmitting || readOnly}
                {...register("quantity")}
              />
              {errors.quantity ? (
                <p className="text-xs text-destructive">{errors.quantity.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="low-stock">
                Low Stock Alert Quantity <span className="text-primary">*</span>
              </Label>
              <Input
                id="low-stock"
                type="number"
                min="0"
                step="1"
                className={inputClass}
                disabled={isSubmitting || readOnly}
                {...register("lowStockAlert")}
              />
              {errors.lowStockAlert ? (
                <p className="text-xs text-destructive">{errors.lowStockAlert.message}</p>
              ) : null}
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                rows={3}
                disabled={isSubmitting || readOnly}
                className={cn(
                  "w-full resize-y rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm",
                  "placeholder:text-neutral-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary",
                )}
                {...register("description")}
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="product-image">Product Image Upload</Label>
              <Input
                id="product-image"
                type="file"
                accept="image/*"
                className={inputClass}
                disabled={isSubmitting || readOnly}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  setValue("imageFileName", file?.name ?? "");
                }}
              />
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-border/60 pt-4 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            {!readOnly ? (
              <Button
                type="submit"
                disabled={isSubmitting}
                className="border-0 bg-primary font-semibold text-primary-foreground hover:bg-primary/90"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  "Save Product"
                )}
              </Button>
            ) : null}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
