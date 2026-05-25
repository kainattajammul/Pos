"use client";

import { useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  PREFIX_OPTIONS,
  SALES_COMMISSION_AGENT_FORM_DEFAULTS,
  formValuesToPayload,
  mapAgentToFormValues,
  salesCommissionAgentFormSchema,
  type SalesCommissionAgentFormValues,
} from "@/lib/sales-commission-agent-form";
import type { SalesCommissionAgentTableRow } from "@/types/sales-commission-agent";

const inputClass =
  "h-10 border-neutral-200 bg-white text-sm shadow-sm placeholder:text-neutral-400";

interface SalesCommissionAgentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit";
  agent: SalesCommissionAgentTableRow | null;
  isSubmitting?: boolean;
  onSave: (values: ReturnType<typeof formValuesToPayload>) => void;
}

export function SalesCommissionAgentFormDialog({
  open,
  onOpenChange,
  mode,
  agent,
  isSubmitting = false,
  onSave,
}: SalesCommissionAgentFormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SalesCommissionAgentFormValues>({
    resolver: zodResolver(salesCommissionAgentFormSchema) as Resolver<SalesCommissionAgentFormValues>,
    defaultValues: SALES_COMMISSION_AGENT_FORM_DEFAULTS,
  });

  const prefix = watch("prefix");

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && agent) {
      reset(mapAgentToFormValues(agent));
    } else {
      reset(SALES_COMMISSION_AGENT_FORM_DEFAULTS);
    }
  }, [open, mode, agent, reset]);

  const title =
    mode === "add" ? "Add sales commission agent" : "Edit sales commission agent";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[min(90vh,640px)] gap-0 overflow-y-auto p-0 sm:max-w-xl"
        showCloseButton
      >
        <div className="border-b border-border/60 px-4 py-4 sm:px-5">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
          </DialogHeader>
        </div>

        <form
          className="flex flex-col gap-4 px-4 py-4 sm:px-5"
          onSubmit={handleSubmit((values) => onSave(formValuesToPayload(values)))}
          noValidate
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="agent-prefix">Prefix</Label>
              <Select
                value={prefix || "none"}
                onValueChange={(v) => setValue("prefix", v === "none" ? "" : (v ?? ""))}
                disabled={isSubmitting}
              >
                <SelectTrigger id="agent-prefix" className={cn("w-full", inputClass)}>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">—</SelectItem>
                  {PREFIX_OPTIONS.filter(Boolean).map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="agent-firstName">
                First Name <span className="text-primary">*</span>
              </Label>
              <Input
                id="agent-firstName"
                className={inputClass}
                disabled={isSubmitting}
                {...register("firstName")}
              />
              {errors.firstName ? (
                <p className="text-xs text-destructive">{errors.firstName.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="agent-lastName">Last Name</Label>
              <Input
                id="agent-lastName"
                className={inputClass}
                disabled={isSubmitting}
                {...register("lastName")}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="agent-email">Email</Label>
              <Input
                id="agent-email"
                type="email"
                autoComplete="email"
                className={inputClass}
                disabled={isSubmitting}
                {...register("email")}
              />
              {errors.email ? (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="agent-contactNumber">Contact Number</Label>
              <Input
                id="agent-contactNumber"
                type="tel"
                className={inputClass}
                disabled={isSubmitting}
                {...register("contactNumber")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="agent-address">Address</Label>
            <textarea
              id="agent-address"
              rows={3}
              className={cn(
                "flex w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm shadow-sm outline-none placeholder:text-neutral-400 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
                inputClass,
                "h-auto min-h-[80px]",
              )}
              disabled={isSubmitting}
              {...register("address")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="agent-salesCommissionPercent">
              Sales Commission Percentage (%)
            </Label>
            <Input
              id="agent-salesCommissionPercent"
              type="number"
              min={0}
              max={100}
              step="0.01"
              placeholder="e.g. 5"
              className={cn(inputClass, "max-w-[200px]")}
              disabled={isSubmitting}
              {...register("salesCommissionPercent")}
            />
            {errors.salesCommissionPercent ? (
              <p className="text-xs text-destructive">
                {errors.salesCommissionPercent.message}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-border/60 pt-4 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Close
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="border-0 bg-primary font-semibold text-primary-foreground hover:bg-primary/90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  {mode === "edit" ? "Updating…" : "Saving…"}
                </>
              ) : mode === "edit" ? (
                "Update"
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
