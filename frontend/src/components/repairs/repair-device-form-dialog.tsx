"use client";

import { useEffect, useRef, useState } from "react";
import { CloudUpload, ImageIcon } from "lucide-react";
import { APP_CONFIG } from "@/constants/config";
import { useUploadRepairDeviceImage } from "@/hooks/use-repair-devices";
import type { RepairDevice } from "@/lib/repairs-devices-data";
import {
  DevicePreviewIcon,
  resolveDeviceIconVariant,
} from "@/components/repairs/device-preview-icon";
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

export interface RepairDeviceFormValues {
  name: string;
  imageUrl: string | null;
}

interface RepairDeviceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  repairCategoryId: number;
  repairManufacturerId: number;
  categoryId?: string | null;
  isSubmitting?: boolean;
  device?: RepairDevice | null;
  onSave: (values: RepairDeviceFormValues) => void;
}

export function RepairDeviceFormDialog({
  open,
  onOpenChange,
  repairCategoryId,
  repairManufacturerId,
  categoryId,
  isSubmitting = false,
  device = null,
  onSave,
}: RepairDeviceFormDialogProps) {
  const shopId = APP_CONFIG.defaultShopId;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEdit = Boolean(device?.dbId);

  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFailed, setImageFailed] = useState(false);

  const uploadImage = useUploadRepairDeviceImage(
    shopId,
    repairCategoryId,
    repairManufacturerId,
  );

  useEffect(() => {
    if (!open) return;

    if (device && !device.isAdd) {
      setName(device.name);
      setImageUrl(device.imageUrl ?? null);
      setImagePreview(null);
      setImageFailed(false);
    } else {
      setName("");
      setImageUrl(null);
      setImagePreview(null);
      setImageFailed(false);
    }
  }, [open, device]);

  const handlePickImage = async (file: File | undefined) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }

    const preview = URL.createObjectURL(file);
    setImagePreview(preview);
    setImageFailed(false);

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
    setImageFailed(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const previewName = name.trim() || "Device name";
  const displayImage = imagePreview ?? (imageUrl && !imageFailed ? imageUrl : null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      toast.error("Device name must be at least 2 characters");
      return;
    }
    onSave({ name: trimmed, imageUrl });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-md" showCloseButton>
        <DialogTitle className="sr-only">
          {isEdit ? "Edit device" : "Add device"}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <div className="border-b border-[#E5E7EB] px-5 py-4">
            <h2 className="text-base font-semibold text-[#111827]">
              {isEdit ? "Edit Device" : "Add Device"}
            </h2>
            <p className="mt-0.5 text-xs text-[#6B7280]">
              Upload a photo or use the default icon for this repair category.
            </p>
          </div>

          <div className="space-y-4 px-5 py-4">
            <div className="overflow-hidden rounded-lg border border-[#E5E7EB]">
              {displayImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={displayImage}
                  alt=""
                  className="h-[120px] w-full object-contain bg-[#F3F4F6]"
                  onError={() => setImageFailed(true)}
                />
              ) : (
                <DevicePreviewIcon
                  deviceName={previewName}
                  categoryId={categoryId}
                  iconVariant={device?.iconVariant}
                  className="rounded-none"
                />
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="device-name">Device name</Label>
              <Input
                id="device-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. iPhone 15 Pro Max"
                className={fieldClass}
                required
                minLength={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Device image (optional)</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handlePickImage(e.target.files?.[0])}
              />
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  disabled={uploadImage.isPending}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <CloudUpload className="size-4" />
                  {uploadImage.isPending ? "Uploading…" : "Upload image"}
                </Button>
                {(imageUrl || imagePreview) && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-[#6B7280]"
                    onClick={clearImage}
                  >
                    <ImageIcon className="size-4" />
                    Use default icon
                  </Button>
                )}
              </div>
              <p className="text-xs text-[#6B7280]">
                Without an image, shows{" "}
                {resolveDeviceIconVariant(categoryId, previewName)} icon for this
                category.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-[#E5E7EB] px-5 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || uploadImage.isPending}
              className={cn(
                "bg-[var(--repair-primary)] text-[var(--repair-on-primary)] hover:opacity-90",
              )}
            >
              {isSubmitting ? "Saving…" : isEdit ? "Save changes" : "Add device"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
