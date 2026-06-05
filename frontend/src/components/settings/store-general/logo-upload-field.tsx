"use client";

import { Trash2, Upload } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LogoUploadFieldProps {
  value: string | null;
  onChange: (dataUrl: string | null) => void;
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function LogoUploadField({ value, onChange }: LogoUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      const file = files?.[0];
      if (!file || !file.type.startsWith("image/")) return;
      const dataUrl = await readFileAsDataUrl(file);
      onChange(dataUrl);
    },
    [onChange],
  );

  return (
    <div className="space-y-2">
      <span className="text-sm font-medium text-[#374151]">Logo</span>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="flex size-16 shrink-0 items-center justify-center rounded-sm border border-[#E5E7EB] bg-[#F9FAFB] text-xs text-[#9CA3AF]">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="Store logo preview" className="size-full rounded-sm object-contain" />
          ) : (
            "No image"
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              void handleFiles(e.dataTransfer.files);
            }}
            className={cn(
              "flex min-h-[72px] items-center justify-center rounded-sm border-2 border-dashed px-4 py-4 text-sm text-[#9CA3AF] transition-colors",
              dragOver
                ? "border-(--repair-primary) bg-[#F0FDFA]"
                : "border-[#D1D5DB] bg-white",
            )}
          >
            Drop Image Here...
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              className="h-8 gap-1.5 rounded-sm border-0 bg-(--repair-primary) px-3 text-xs font-semibold text-(--repair-on-primary) hover:opacity-90"
              onClick={() => inputRef.current?.click()}
            >
              <Upload className="size-3.5" />
              Upload...
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-8 gap-1.5 rounded-sm border-[#E5E7EB] bg-white px-3 text-xs font-medium text-[#374151] hover:bg-[#F9FAFB]"
              onClick={() => onChange(null)}
              disabled={!value}
            >
              <Trash2 className="size-3.5" />
              Remove
            </Button>
          </div>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => void handleFiles(e.target.files)}
      />
    </div>
  );
}
