"use client";

import { useEffect, useRef, useState } from "react";
import { CloudUpload, ImageIcon, Search } from "lucide-react";
import { APP_CONFIG } from "@/constants/config";
import {
  useRepairManufacturerIconSearch,
  useUploadRepairManufacturerImage,
} from "@/hooks/use-repair-manufacturers";
import type { RepairManufacturer } from "@/lib/repairs-pos-data";
import { ManufacturerBrandMark } from "@/components/repairs/manufacturer-brand-mark";
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

export interface RepairManufacturerFormValues {
  name: string;
  logoSlug: string;
  iconKey: string;
  imageUrl: string | null;
}

interface RepairManufacturerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  repairCategoryId: number;
  isSubmitting?: boolean;
  manufacturer?: RepairManufacturer | null;
  onSave: (values: RepairManufacturerFormValues) => void;
}

type VisualMode = "brand" | "image";

export function RepairManufacturerFormDialog({
  open,
  onOpenChange,
  repairCategoryId,
  isSubmitting = false,
  manufacturer = null,
  onSave,
}: RepairManufacturerFormDialogProps) {
  const shopId = APP_CONFIG.defaultShopId;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEdit = Boolean(manufacturer?.dbId);

  const [name, setName] = useState("");
  const [logoSlug, setLogoSlug] = useState("apple");
  const [brandSearch, setBrandSearch] = useState("");
  const [visualMode, setVisualMode] = useState<VisualMode>("brand");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const uploadImage = useUploadRepairManufacturerImage(shopId, repairCategoryId);
  const { data: brandOptions = [], isLoading: brandsLoading } =
    useRepairManufacturerIconSearch(brandSearch, open && visualMode === "brand");

  useEffect(() => {
    if (!open) return;

    if (manufacturer && !manufacturer.isAdd) {
      setName(manufacturer.name);
      setLogoSlug(manufacturer.logoSlug ?? manufacturer.id ?? "apple");
      setBrandSearch("");
      if (manufacturer.imageUrl) {
        setVisualMode("image");
        setImageUrl(manufacturer.imageUrl);
        setImagePreview(null);
      } else {
        setVisualMode("brand");
        setImageUrl(null);
        setImagePreview(null);
      }
    } else {
      setName("");
      setLogoSlug("apple");
      setBrandSearch("");
      setVisualMode("brand");
      setImageUrl(null);
      setImagePreview(null);
    }
  }, [open, manufacturer]);

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
    setVisualMode("brand");
  };

  const handleSave = () => {
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      toast.error("Manufacturer name must be at least 2 characters");
      return;
    }

    if (visualMode === "image" && !imageUrl) {
      toast.error("Upload an image or switch to brand logo");
      return;
    }

    if (visualMode === "brand" && !logoSlug) {
      toast.error("Select a brand logo");
      return;
    }

    onSave({
      name: trimmed,
      logoSlug: visualMode === "brand" ? logoSlug : trimmed.toLowerCase().replace(/\s+/g, "-"),
      iconKey: logoSlug,
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
            {isEdit ? "Edit manufacturer" : "Add manufacturer"}
          </DialogTitle>
        </div>

        <div className="space-y-5 px-6 py-5">
          <div className="space-y-2">
            <Label htmlFor="manufacturer-name" className="text-sm font-medium text-[#374151]">
              Manufacturer name
            </Label>
            <Input
              id="manufacturer-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Apple"
              className={fieldClass}
              disabled={busy}
            />
          </div>

          <div className="flex gap-2 rounded-lg bg-[#F3F4F6] p-1">
            <button
              type="button"
              onClick={() => setVisualMode("brand")}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-colors",
                visualMode === "brand"
                  ? "bg-white text-[#111827] shadow-sm"
                  : "text-[#6B7280] hover:text-[#111827]",
              )}
            >
              <Search className="size-4" />
              Brand logo
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
              Custom image
            </button>
          </div>

          {visualMode === "brand" ? (
            <div className="space-y-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#9CA3AF]" />
                <Input
                  value={brandSearch}
                  onChange={(e) => setBrandSearch(e.target.value)}
                  placeholder="Search brands (Apple, Samsung, Google…)"
                  className={cn(fieldClass, "pl-9")}
                  disabled={busy}
                />
              </div>

              <div className="grid max-h-52 grid-cols-4 gap-2 overflow-y-auto rounded-lg border border-[#E5E7EB] p-2 sm:grid-cols-5">
                {brandsLoading && (
                  <p className="col-span-full py-4 text-center text-xs text-[#6B7280]">
                    Loading brands…
                  </p>
                )}
                {!brandsLoading &&
                  brandOptions.map((option) => {
                    const selected = logoSlug === option.logoSlug;
                    return (
                      <button
                        key={option.key}
                        type="button"
                        title={option.label}
                        onClick={() => {
                          setLogoSlug(option.logoSlug);
                          if (!name.trim()) setName(option.label);
                        }}
                        className={cn(
                          "flex flex-col items-center justify-center gap-1 rounded-md border p-2 transition-colors",
                          selected
                            ? "border-[var(--repair-primary)] bg-[var(--repair-primary)]/5 ring-1 ring-[var(--repair-primary)]"
                            : "border-transparent hover:border-[#E5E7EB] hover:bg-[#F9FAFB]",
                        )}
                      >
                        <ManufacturerBrandMark
                          name={option.label}
                          logoSlug={option.logoSlug}
                          size="sm"
                        />
                        <span className="line-clamp-1 w-full text-center text-[10px] font-medium text-[#374151]">
                          {option.label}
                        </span>
                      </button>
                    );
                  })}
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
                    alt="Manufacturer preview"
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
                  <span className="text-sm font-medium">Upload custom logo</span>
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
            {busy ? "Saving…" : isEdit ? "Save changes" : "Save manufacturer"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
