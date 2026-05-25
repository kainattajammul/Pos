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

interface DeleteSalesCommissionAgentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agentLabel: string;
  isPending?: boolean;
  onConfirm: () => void;
}

export function DeleteSalesCommissionAgentDialog({
  open,
  onOpenChange,
  agentLabel,
  isPending = false,
  onConfirm,
}: DeleteSalesCommissionAgentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-4 sm:max-w-md" showCloseButton>
        <DialogHeader>
          <DialogTitle className="text-lg">Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. Are you sure you want to delete{" "}
            <span className="font-medium text-foreground">{agentLabel}</span>?
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
