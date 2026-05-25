"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
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
        className="border-[#E5E7EB] sm:max-w-md"
        overlayClassName="z-[60] bg-black/20"
      >
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-[#111827]">
            {title}
          </DialogTitle>
          <DialogDescription className="text-sm text-[#6B7280]">
            Are you sure you want to delete{" "}
            <span className="font-medium text-[#111827]">&quot;{itemName}&quot;</span>
            ? {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting…" : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
