"use client";

import { useEffect, useRef, useState } from "react";
import { CloudUpload, ImageIcon, Search } from "lucide-react";
import { APP_CONFIG } from "@/constants/config";
import {
  useRepairDeviceIssueIconSearch,
  useUploadRepairDeviceIssueImage,
} from "@/hooks/use-repair-device-issues";
import { RepairProblemIconMark } from "@/components/repairs/repair-problem-icon";
import type { RepairProblem } from "@/lib/repairs-problems-data";
import type { RepairProblemIcon } from "@/lib/repair-issue-icons";
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

export interface RepairDeviceIssueFormValues {
  name: string;
  price: number;
  iconKey: RepairProblemIcon;
  imageUrl: string | null;
}

type VisualMode = "icon" | "image";

interface RepairDeviceIssueFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  repairCategoryId: number;
  repairManufacturerId: number;
  repairDeviceId: number;
  isSubmitting?: boolean;
  issue?: RepairProblem | null;
  onSave: (values: RepairDeviceIssueFormValues) => void;
}

export function RepairDeviceIssueFormDialog({
  open,
  onOpenChange,
  repairCategoryId,
  repairManufacturerId,
  repairDeviceId,
  isSubmitting = false,
  issue = null,
  onSave,
}: RepairDeviceIssueFormDialogProps) {
  const shopId = APP_CONFIG.defaultShopId;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEdit = Boolean(issue?.dbId);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [iconKey, setIconKey] = useState<RepairProblemIcon>("diagnostic");
  const [iconSearch, setIconSearch] = useState("");
  const [visualMode, setVisualMode] = useState<VisualMode>("icon");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const uploadImage = useUploadRepairDeviceIssueImage(
    shopId,
    repairCategoryId,
    repairManufacturerId,
    repairDeviceId,
  );
  const { data: iconOptions = [], isLoading: iconsLoading } =
    useRepairDeviceIssueIconSearch(iconSearch, open && visualMode === "icon");

  useEffect(() => {
    if (!open) return;

    if (issue && !issue.isAdd) {
      setName(issue.name);
      setPrice(String(issue.price));
      setIconKey(issue.icon);
      setIconSearch("");
      if (issue.imageUrl) {
        setVisualMode("image");
        setImageUrl(issue.imageUrl);
        setImagePreview(null);
      } else {
        setVisualMode("icon");
        setImageUrl(null);
        setImagePreview(null);
      }
    } else {
      setName("");
      setPrice("");
      setIconKey("diagnostic");
      setIconSearch("");
      setVisualMode("icon");
      setImageUrl(null);
      setImagePreview(null);
    }
  }, [open, issue]);

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
      toast.error("Issue name must be at least 2 characters");
      return;
    }
    const parsedPrice = Number.parseFloat(price);
    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      toast.error("Enter a valid price");
      return;
    }

    if (visualMode === "image" && !imageUrl) {
      toast.error("Upload an image or switch to icon");
      return;
    }

    onSave({
      name: trimmed,
      price: parsedPrice,
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
            {isEdit ? "Edit device issue" : "Add device issue"}
          </DialogTitle>
        </div>

        <div className="space-y-5 px-6 py-5">
          <div className="space-y-2">
            <Label htmlFor="issue-name" className="text-sm font-medium text-[#374151]">
              Issue name
            </Label>
            <Input
              id="issue-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Screen Replacement"
              className={fieldClass}
              disabled={busy}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="issue-price" className="text-sm font-medium text-[#374151]">
              Price ($)
            </Label>
            <Input
              id="issue-price"
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
                  placeholder="Search icons (screen, battery, water…)"
                  className={cn(fieldClass, "pl-9")}
                  disabled={busy}
                />
              </div>

              <div className="grid max-h-52 grid-cols-4 gap-2 overflow-y-auto rounded-lg border border-[#E5E7EB] p-2 sm:grid-cols-5">
                {iconsLoading && (
                  <p className="col-span-full py-4 text-center text-xs text-[#6B7280]">
                    Loading icons…
                  </p>
                )}
                {!iconsLoading &&
                  iconOptions.map((opt) => {
                    const selected = iconKey === opt.key;
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        title={opt.label}
                        onClick={() => setIconKey(opt.key)}
                        className={cn(
                          "flex flex-col items-center justify-center gap-1 rounded-md p-2 transition-colors",
                          selected
                            ? "bg-[var(--repair-primary)] text-white"
                            : "hover:bg-[#F3F4F6] text-[#374151]",
                        )}
                      >
                        <RepairProblemIconMark
                          icon={opt.key}
                          className={cn("size-6", selected && "text-white")}
                        />
                        <span
                          className={cn(
                            "line-clamp-2 w-full text-center text-[10px] font-medium leading-tight",
                            selected ? "text-white" : "text-[#374151]",
                          )}
                        >
                          {opt.label}
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
                    alt="Issue preview"
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
                  <span className="text-sm font-medium">Upload issue image</span>
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
            {busy ? "Saving…" : isEdit ? "Save changes" : "Save issue"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
