"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Camera, ChevronDown, ImagePlus, Laptop, Trash2, Upload } from "lucide-react";
import { ConditionImageWebcamDialog } from "@/components/repairs/condition-image-webcam-dialog";
import {
  createConditionImageFromFile,
  revokeConditionImage,
  type RepairConditionImage,
} from "@/lib/repairs-condition-images";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface RepairsConditionImagesPanelProps {
  images: RepairConditionImage[];
  onImagesChange: (images: RepairConditionImage[]) => void;
}

export function RepairsConditionImagesPanel({
  images,
  onImagesChange,
}: RepairsConditionImagesPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [webcamOpen, setWebcamOpen] = useState(false);

  const addFiles = (files: FileList | File[] | null) => {
    if (!files?.length) return;

    const list = Array.from(files);
    const imageFiles = list.filter((f) => f.type.startsWith("image/"));
    if (imageFiles.length === 0) {
      toast.error("Please select image files only");
      return;
    }

    const added = imageFiles.map(createConditionImageFromFile);
    onImagesChange([...images, ...added]);
    toast.success(
      added.length === 1 ? "1 image uploaded" : `${added.length} images uploaded`,
    );
  };

  const handleRemove = (id: string) => {
    const target = images.find((img) => img.id === id);
    if (target) revokeConditionImage(target);
    onImagesChange(images.filter((img) => img.id !== id));
  };

  const uploadMenu = (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            className="h-9 gap-1.5 rounded-md border-0 px-4 text-sm font-semibold text-[var(--repair-on-primary)] shadow-sm hover:opacity-90"
            style={{ backgroundColor: "var(--repair-primary)" }}
          >
            <Upload className="size-4" aria-hidden />
            Upload Images
            <ChevronDown className="size-3.5 opacity-80" aria-hidden />
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => inputRef.current?.click()}
          className="gap-2"
        >
          <Laptop className="size-4" />
          From computer
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setWebcamOpen(true)} className="gap-2">
          <Camera className="size-4" />
          Take photo (webcam)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        onChange={(e) => {
          addFiles(e.target.files);
          e.target.value = "";
        }}
      />

      <ConditionImageWebcamDialog
        open={webcamOpen}
        onOpenChange={setWebcamOpen}
        onCapture={(file) => addFiles([file])}
      />

      <div className="mb-4 flex shrink-0 items-center justify-between gap-3">
        <p className="text-sm text-[#6B7280]">
          {images.length === 0
            ? "No condition images yet"
            : `${images.length} image${images.length === 1 ? "" : "s"} uploaded`}
        </p>
        {uploadMenu}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
        {images.length === 0 ? (
          <div className="flex min-h-[280px] flex-col items-center justify-center rounded-xl border border-dashed border-[#E5E7EB] bg-[#F9FAFB] p-8 text-center">
            <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--repair-primary)_12%,white)]">
              <ImagePlus className="size-7 text-[var(--repair-primary)]" aria-hidden />
            </div>
            <p className="text-sm font-medium text-[#374151]">
              Pre-Repair Condition Images
            </p>
            <p className="mt-1 max-w-sm text-xs text-[#6B7280]">
              Upload from your computer or capture a photo using your webcam.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => inputRef.current?.click()}
                className="h-9 gap-1.5 border-[#E5E7EB]"
              >
                <Laptop className="size-4" />
                From computer
              </Button>
              <Button
                type="button"
                onClick={() => setWebcamOpen(true)}
                className="h-9 gap-1.5 border-0 text-[var(--repair-on-primary)] hover:opacity-90"
                style={{ backgroundColor: "var(--repair-primary)" }}
              >
                <Camera className="size-4" />
                Webcam
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {images.map((image) => (
              <ConditionImageCard
                key={image.id}
                image={image}
                onRemove={() => handleRemove(image.id)}
              />
            ))}
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <button
                    type="button"
                    className="flex min-h-[140px] w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-[#D1D5DB] bg-[#F9FAFB] text-[#6B7280] transition-colors hover:border-[var(--repair-primary)] hover:bg-white hover:text-[var(--repair-primary)]"
                  >
                    <Upload className="size-6" aria-hidden />
                    <span className="text-xs font-medium">Add more</span>
                  </button>
                }
              />
              <DropdownMenuContent align="center">
                <DropdownMenuItem onClick={() => inputRef.current?.click()}>
                  From computer
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setWebcamOpen(true)}>
                  Take photo (webcam)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </div>
  );
}

function ConditionImageCard({
  image,
  onRemove,
}: {
  image: RepairConditionImage;
  onRemove: () => void;
}) {
  return (
    <div className="group relative overflow-hidden rounded-lg border border-[#E5E7EB] bg-white shadow-sm">
      <div className="relative aspect-[4/3] w-full bg-[#F3F4F6]">
        <Image
          src={image.url}
          alt={image.name}
          fill
          unoptimized
          className="object-cover"
          sizes="(max-width: 768px) 50vw, 20vw"
        />
      </div>
      <div className="border-t border-[#F3F4F6] px-2 py-1.5">
        <p className="truncate text-[11px] font-medium text-[#374151]" title={image.name}>
          {image.name}
        </p>
      </div>
      <button
        type="button"
        onClick={onRemove}
        className={cn(
          "absolute top-1.5 right-1.5 flex size-7 items-center justify-center rounded-md",
          "bg-black/55 text-white opacity-0 transition-opacity group-hover:opacity-100",
          "hover:bg-black/70 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-white/80",
        )}
        aria-label={`Remove ${image.name}`}
      >
        <Trash2 className="size-3.5" />
      </button>
    </div>
  );
}
