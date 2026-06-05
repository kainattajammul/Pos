"use client";

import { useEffect, useRef, useState } from "react";
import { CloudUpload, ImageIcon, Search } from "lucide-react";
import { APP_CONFIG } from "@/constants/config";
import {
  useRepairCategoryIconSearch,
  useUploadRepairCategoryImage,
} from "@/hooks/use-repair-categories";
import { resolveRepairCategoryIcon } from "@/lib/repair-category-icons";
import type { RepairCategoryCard } from "@/lib/repairs-pos-data";
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

export interface RepairCategoryFormValues {
  name: string;
  iconKey: string;
  imageUrl: string | null;
}

interface RepairCategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isSubmitting?: boolean;
  /** When set, dialog opens in edit mode with fields pre-filled */
  category?: RepairCategoryCard | null;
  onSave: (values: RepairCategoryFormValues) => void;
}

type VisualMode = "icon" | "image";

export function RepairCategoryFormDialog({
  open,
  onOpenChange,
  isSubmitting = false,
  category = null,
  onSave,
}: RepairCategoryFormDialogProps) {
  const shopId = APP_CONFIG.defaultShopId;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEdit = Boolean(category?.dbId);

  const [name, setName] = useState("");
  const [iconKey, setIconKey] = useState("wrench");
  const [iconSearch, setIconSearch] = useState("");
  const [visualMode, setVisualMode] = useState<VisualMode>("icon");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const uploadImage = useUploadRepairCategoryImage(shopId);
  const { data: iconOptions = [], isLoading: iconsLoading } = useRepairCategoryIconSearch(
    iconSearch,
    open && visualMode === "icon",
  );

  useEffect(() => {
    if (!open) return;

    if (category && !category.isAdd) {
      setName(category.label);
      setIconKey(category.iconKey ?? "wrench");
      setIconSearch("");
      if (category.imageUrl) {
        setVisualMode("image");
        setImageUrl(category.imageUrl);
        setImagePreview(null);
      } else {
        setVisualMode("icon");
        setImageUrl(null);
        setImagePreview(null);
      }
    } else {
      setName("");
      setIconKey("wrench");
      setIconSearch("");
      setVisualMode("icon");
      setImageUrl(null);
      setImagePreview(null);
    }
  }, [open, category]);

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
      toast.error("Category name must be at least 2 characters");
      return;
    }

    if (visualMode === "image" && !imageUrl) {
      toast.error("Upload an image or switch to icon");
      return;
    }

    onSave({
      name: trimmed,
      iconKey,
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
            {isEdit ? "Edit repair category" : "Add repair category"}
          </DialogTitle>
        </div>

        <div className="space-y-5 px-6 py-5">
          <div className="space-y-2">
            <Label htmlFor="category-name" className="text-sm font-medium text-[#374151]">
              Category name
            </Label>
            <Input
              id="category-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Console Repair"
              className={fieldClass}
              disabled={busy}
            />
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
              Icon
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
                  placeholder="Search icons (phone, laptop, wrench…)"
                  className={cn(fieldClass, "pl-9")}
                  disabled={busy}
                />
              </div>

              <div className="grid max-h-48 grid-cols-6 gap-2 overflow-y-auto rounded-lg border border-[#E5E7EB] p-2">
                {iconsLoading && (
                  <p className="col-span-6 py-4 text-center text-xs text-[#6B7280]">
                    Loading icons…
                  </p>
                )}
                {!iconsLoading &&
                  iconOptions.map((option) => {
                    const OptionIcon = resolveRepairCategoryIcon(option.key);
                    const selected = iconKey === option.key;
                    return (
                      <button
                        key={option.key}
                        type="button"
                        title={option.label}
                        onClick={() => setIconKey(option.key)}
                        className={cn(
                          "flex flex-col items-center justify-center gap-1 rounded-md p-2 transition-colors",
                          selected
                            ? "bg-[var(--repair-primary)] text-white"
                            : "hover:bg-[#F3F4F6] text-[#374151]",
                        )}
                      >
                        <OptionIcon className="size-5" />
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
                <div className="relative flex flex-col items-center gap-3 rounded-lg border border-[#E5E7EB] bg-pos-page p-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagePreview ?? imageUrl ?? ""}
                    alt="Category preview"
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
                  className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[#D1D5DB] bg-pos-page px-6 py-10 text-[#6B7280] transition-colors hover:border-[var(--repair-primary)] hover:bg-white hover:text-[var(--repair-primary)]"
                >
                  <CloudUpload className="size-8" />
                  <span className="text-sm font-medium">Upload category image</span>
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
            {busy ? "Saving…" : isEdit ? "Save changes" : "Save category"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
