"use client";

import { ChevronDown, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

interface EstimateAttachmentsSectionProps {
  open: boolean;
  onToggle: () => void;
  fileNames: string[];
  onFilesSelected: (files: FileList | null) => void;
}

export function EstimateAttachmentsSection({
  open,
  onToggle,
  fileNames,
  onFilesSelected,
}: EstimateAttachmentsSectionProps) {
  return (
    <section className="mt-4 border border-[#E5E7EB] bg-white">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between border-b-2 border-(--repair-primary) px-4 py-3 text-left"
      >
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-(--repair-primary)">
          <Upload className="size-4" />
          Upload Attachments
        </span>
        <ChevronDown
          className={cn("size-5 text-(--repair-primary) transition-transform", open && "rotate-180")}
        />
      </button>
      {open ? (
        <div className="p-4">
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-[#D1D5DB] bg-[#F9FAFB] px-4 py-8 text-center hover:border-(--repair-primary)">
            <Upload className="mb-2 size-8 text-[#9CA3AF]" />
            <span className="text-sm font-medium text-[#374151]">
              Drag and drop files here, or click to browse
            </span>
            <input
              type="file"
              multiple
              className="sr-only"
              onChange={(e) => onFilesSelected(e.target.files)}
            />
          </label>
          {fileNames.length > 0 ? (
            <ul className="mt-3 space-y-1 text-sm text-[#374151]">
              {fileNames.map((name) => (
                <li key={name}>{name}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
