"use client";

import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export interface DeleteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Label shown in bold (name, email, category title, etc.) */
  itemLabel: string;
  /**
   * Optional noun before the label, e.g. "category", "manufacturer", "role".
   * Omit for a plain "delete {itemLabel}" message (users list).
   */
  entityType?: string;
  isPending?: boolean;
  onConfirm: () => void;
}

export function DeleteUserDialog({
  open,
  onOpenChange,
  itemLabel,
  entityType,
  isPending = false,
  onConfirm,
}: DeleteUserDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-4 sm:max-w-md" showCloseButton>
        <DialogHeader>
          <DialogTitle className="text-lg">Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. Are you sure you want to delete
            {entityType ? ` ${entityType} ` : " "}
            <span className="font-medium text-foreground">{itemLabel}</span>?
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={isPending}
            className="border-0 bg-destructive font-semibold text-white hover:bg-destructive/90"
            onClick={onConfirm}
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Deleting…
              </>
            ) : (
              "Confirm"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
