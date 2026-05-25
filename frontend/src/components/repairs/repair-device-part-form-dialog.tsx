"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CloudUpload, ImageIcon, Search } from "lucide-react";
import { APP_CONFIG } from "@/constants/config";
import { useUploadRepairDevicePartImage } from "@/hooks/use-repair-device-parts";
import { RepairPartPreview } from "@/components/repairs/repair-part-preview";
import type { RepairPart } from "@/lib/repairs-parts-data";
import {
  REPAIR_PART_IMAGE_VARIANTS,
  REPAIR_PART_VARIANT_LABELS,
  type RepairPartImageVariant,
} from "@/lib/repairs-parts-data";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const fieldClass =
  "h-10 w-full rounded-md border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:border-[var(--repair-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--repair-primary)]";

export interface RepairDevicePartFormValues {
  name: string;
  price: number;
  onHand: number;
  imageVariant: RepairPartImageVariant;
  imageUrl: string | null;
}

type VisualMode = "icon" | "image";

interface RepairDevicePartFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  repairCategoryId: number;
  repairManufacturerId: number;
  repairDeviceId: number;
  isSubmitting?: boolean;
  part?: RepairPart | null;
  onSave: (values: RepairDevicePartFormValues) => void;
}

export function RepairDevicePartFormDialog({
  open,
  onOpenChange,
  repairCategoryId,
  repairManufacturerId,
  repairDeviceId,
  isSubmitting = false,
  part = null,
  onSave,
}: RepairDevicePartFormDialogProps) {
  const shopId = APP_CONFIG.defaultShopId;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEdit = Boolean(part?.dbId);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [onHand, setOnHand] = useState("");
  const [imageVariant, setImageVariant] = useState<RepairPartImageVariant>("screen");
  const [iconSearch, setIconSearch] = useState("");
  const [visualMode, setVisualMode] = useState<VisualMode>("icon");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const uploadImage = useUploadRepairDevicePartImage(
    shopId,
    repairCategoryId,
    repairManufacturerId,
    repairDeviceId,
  );

  const filteredVariants = useMemo(() => {
    const q = iconSearch.trim().toLowerCase();
    if (!q) return REPAIR_PART_IMAGE_VARIANTS;
    return REPAIR_PART_IMAGE_VARIANTS.filter((variant) => {
      const label = REPAIR_PART_VARIANT_LABELS[variant].toLowerCase();
      return label.includes(q) || variant.includes(q);
    });
  }, [iconSearch]);

  useEffect(() => {
    if (!open) return;

    if (part && !part.isAdd) {
      setName(part.name);
      setPrice(String(part.price));
      setOnHand(String(part.onHand));
      setImageVariant(part.image);
      setIconSearch("");
      if (part.imageUrl) {
        setVisualMode("image");
        setImageUrl(part.imageUrl);
        setImagePreview(null);
      } else {
        setVisualMode("icon");
        setImageUrl(null);
        setImagePreview(null);
      }
    } else {
      setName("");
      setPrice("");
      setOnHand("0");
      setImageVariant("screen");
      setIconSearch("");
      setVisualMode("icon");
      setImageUrl(null);
      setImagePreview(null);
    }
  }, [open, part]);

  const handlePickImage = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }

    const preview = URL.createObjectURL(file);
    setImagePreview(preview);
    setVisualMode("image");

    try {
      const result = await uploadImage.mutateAsync(file);
      setImageUrl(result.url);
      toast.success("Image uploaded");
    } catch {
      setImagePreview(null);
      setImageUrl(null);
    }
  };

  const clearImage = () => {
    setImageUrl(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setVisualMode("icon");
  };

  const handleSave = () => {
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      toast.error("Part name must be at least 2 characters");
      return;
    }
    const parsedPrice = Number.parseFloat(price);
    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      toast.error("Enter a valid price");
      return;
    }
    const parsedOnHand = Number.parseInt(onHand, 10);
    if (!Number.isInteger(parsedOnHand) || parsedOnHand < 0) {
      toast.error("On hand must be a non-negative whole number");
      return;
    }

    if (visualMode === "image" && !imageUrl) {
      toast.error("Upload an image or switch to part icon");
      return;
    }

    onSave({
      name: trimmed,
      price: parsedPrice,
      onHand: parsedOnHand,
      imageVariant,
      imageUrl: visualMode === "image" ? imageUrl : null,
    });
  };

  const busy = isSubmitting || uploadImage.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="max-h-[90vh] max-w-lg overflow-y-auto border-[#E5E7EB] p-0 sm:max-w-lg"
      >
        <div className="border-b border-[#E5E7EB] px-6 py-4 pr-12">
          <DialogTitle className="text-lg font-semibold text-[#111827]">
            {isEdit ? "Edit repair part" : "Add repair part"}
          </DialogTitle>
        </div>

        <div className="space-y-5 px-6 py-5">
          <div className="space-y-2">
            <Label htmlFor="part-name" className="text-sm font-medium text-[#374151]">
              Part name
            </Label>
            <Input
              id="part-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. iPhone 12 screen"
              className={fieldClass}
              disabled={busy}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="part-price" className="text-sm font-medium text-[#374151]">
                Price ($)
              </Label>
              <Input
                id="part-price"
                type="number"
                min={0}
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                className={fieldClass}
                disabled={busy}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="part-on-hand" className="text-sm font-medium text-[#374151]">
                On hand
              </Label>
              <Input
                id="part-on-hand"
                type="number"
                min={0}
                step="1"
                value={onHand}
                onChange={(e) => setOnHand(e.target.value)}
                placeholder="0"
                className={fieldClass}
                disabled={busy}
              />
            </div>
          </div>

          <div className="flex gap-2 rounded-lg bg-[#F3F4F6] p-1">
            <button
              type="button"
              onClick={() => setVisualMode("icon")}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-colors",
                visualMode === "icon"
                  ? "bg-white text-[#111827] shadow-sm"
                  : "text-[#6B7280] hover:text-[#111827]",
              )}
            >
              <Search className="size-4" />
              Part icon
            </button>
            <button
              type="button"
              onClick={() => setVisualMode("image")}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-colors",
                visualMode === "image"
                  ? "bg-white text-[#111827] shadow-sm"
                  : "text-[#6B7280] hover:text-[#111827]",
              )}
            >
              <ImageIcon className="size-4" />
              Image
            </button>
          </div>

          {visualMode === "icon" ? (
            <div className="space-y-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#9CA3AF]" />
                <Input
                  value={iconSearch}
                  onChange={(e) => setIconSearch(e.target.value)}
                  placeholder="Search part icons (screen, battery, digitizer…)"
                  className={cn(fieldClass, "pl-9")}
                  disabled={busy}
                />
              </div>

              <div className="grid max-h-64 grid-cols-3 gap-2 overflow-y-auto rounded-lg border border-[#E5E7EB] p-2 sm:grid-cols-4">
                {filteredVariants.length === 0 ? (
                  <p className="col-span-full py-4 text-center text-xs text-[#6B7280]">
                    No matching part icons
                  </p>
                ) : (
                  filteredVariants.map((variant) => {
                    const selected = imageVariant === variant;
                    return (
                      <button
                        key={variant}
                        type="button"
                        title={REPAIR_PART_VARIANT_LABELS[variant]}
                        onClick={() => setImageVariant(variant)}
                        className={cn(
                          "flex flex-col items-center gap-1 rounded-md border p-2 transition-colors",
                          selected
                            ? "border-[var(--repair-primary)] bg-[color-mix(in_srgb,var(--repair-primary)_8%,white)] ring-1 ring-[var(--repair-primary)]"
                            : "border-transparent hover:border-[#E5E7EB] hover:bg-[#F9FAFB]",
                        )}
                      >
                        <RepairPartPreview variant={variant} className="h-14 w-full" />
                        <span className="line-clamp-2 text-center text-[10px] font-medium text-[#374151]">
                          {REPAIR_PART_VARIANT_LABELS[variant]}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                className="hidden"
                onChange={(e) => handlePickImage(e.target.files?.[0])}
              />

              {imagePreview || imageUrl ? (
                <div className="relative flex flex-col items-center gap-3 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagePreview ?? imageUrl ?? ""}
                    alt="Part preview"
                    className="max-h-32 max-w-full rounded-lg object-contain"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={clearImage}
                    disabled={busy}
                  >
                    Remove image
                  </Button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={busy}
                  className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[#D1D5DB] bg-[#F9FAFB] px-6 py-10 text-[#6B7280] transition-colors hover:border-[var(--repair-primary)] hover:bg-white hover:text-[var(--repair-primary)]"
                >
                  <CloudUpload className="size-8" />
                  <span className="text-sm font-medium">Upload part image</span>
                  <span className="text-xs">JPEG, PNG, WebP, GIF or SVG · max 5 MB</span>
                </button>
              )}

              {uploadImage.isPending && (
                <p className="text-center text-xs text-[#6B7280]">Uploading to storage…</p>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-[#E5E7EB] px-6 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={busy}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={busy}
            className="bg-[var(--repair-primary)] text-white hover:opacity-90"
          >
            {busy ? "Saving…" : isEdit ? "Save changes" : "Save part"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
