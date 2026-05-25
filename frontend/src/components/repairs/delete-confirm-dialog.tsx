"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  itemName: string;
  description?: string;
  confirmLabel?: string;
  isDeleting?: boolean;
  onConfirm: () => void;
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  title,
  itemName,
  description = "This action cannot be undone.",
  confirmLabel = "Delete",
  isDeleting = false,
  onConfirm,
}: DeleteConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={!isDeleting}
        className="gap-0 overflow-hidden border-[#E5E7EB] bg-white p-0 sm:max-w-[420px]"
        overlayClassName="bg-black/20 backdrop-blur-none"
      >
        <div className="border-b border-[#E5E7EB] px-6 py-4 pr-12">
          <DialogTitle className="text-lg font-semibold text-[#111827]">
            {title}
          </DialogTitle>
        </div>

        <div className="flex gap-4 px-6 py-5">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-red-50">
            <AlertTriangle className="size-5 text-red-600" aria-hidden />
          </div>
          <div className="min-w-0 space-y-1 pt-0.5">
            <p className="text-sm leading-relaxed text-[#374151]">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-[#111827]">&quot;{itemName}&quot;</span>
              ?
            </p>
            <p className="text-sm text-[#6B7280]">{description}</p>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-[#E5E7EB] bg-[#F9FAFB] px-6 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
            className="min-w-[88px] border-[#E5E7EB] bg-white text-[#374151] hover:bg-[#F3F4F6]"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="min-w-[88px] border-transparent bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
          >
            {isDeleting ? "Deleting…" : confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
