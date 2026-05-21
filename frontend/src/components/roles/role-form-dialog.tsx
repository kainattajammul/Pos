"use client";

import { useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import type { RoleTableRow } from "@/types/role-table";

const baseFields = z.object({
  roleName: z
    .string()
    .min(1, "Role name is required")
    .max(64, "Role name is too long"),
  description: z.string().optional(),
  status: z.enum(["active", "inactive"]),
});

const addSchema = baseFields.extend({
  roleName: z
    .string()
    .trim()
    .min(2, "Role name must be at least 2 characters")
    .max(64, "Role name is too long"),
  shopId: z.string().min(1, "Shop ID is required"),
});

const editSchema = baseFields.extend({
  roleName: z
    .string()
    .trim()
    .min(2, "Role name must be at least 2 characters")
    .max(64, "Role name is too long"),
  shopId: z.string().optional(),
});

type AddFormFields = z.infer<typeof addSchema>;
type EditFormFields = z.infer<typeof editSchema>;
type RoleFormFields = AddFormFields | EditFormFields;

function parseOptionalInt(raw: string | undefined): number | null {
  const t = raw?.trim() ?? "";
  if (t === "") return null;
  const n = Number(t);
  return Number.isFinite(n) && n > 0 ? n : null;
}

interface RoleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit";
  role: RoleTableRow | null;
  isSubmitting?: boolean;
  onSave: (values: {
    roleName: string;
    shopId: number | null;
    description: string | null;
    status: string;
  }) => void;
}

export function RoleFormDialog({
  open,
  onOpenChange,
  mode,
  role,
  isSubmitting = false,
  onSave,
}: RoleFormDialogProps) {
  const schema = mode === "add" ? addSchema : editSchema;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RoleFormFields>({
    resolver: zodResolver(schema) as Resolver<RoleFormFields>,
    defaultValues: {
      roleName: "",
      shopId: "",
      description: "",
      status: "active",
    },
  });

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && role) {
      reset({
        roleName: role.roleName,
        shopId: role.shopId != null ? String(role.shopId) : "",
        description: role.description ?? "",
        status: role.status === "inactive" ? "inactive" : "active",
      });
    } else {
      reset({
        roleName: "",
        shopId: "",
        description: "",
        status: "active",
      });
    }
  }, [open, mode, role, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[min(90vh,560px)] gap-0 overflow-y-auto p-0 sm:max-w-lg"
        showCloseButton
      >
        <div className="border-b border-border/60 px-4 py-4 sm:px-5">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              {mode === "add" ? "Add" : "Update"}
            </DialogTitle>
          </DialogHeader>
        </div>

        <form
          className="flex flex-col gap-4 px-4 py-4 sm:px-5"
          onSubmit={handleSubmit((values) => {
            const addValues = values as AddFormFields;
            const shopId =
              mode === "add" ? parseOptionalInt(addValues.shopId) : parseOptionalInt(values.shopId);
            if (mode === "add" && shopId == null) return;

            onSave({
              roleName: values.roleName.trim().toUpperCase(),
              shopId,
              description: values.description?.trim() ? values.description.trim() : null,
              status: values.status,
            });
          })}
        >
          <div className="space-y-2">
            <Label htmlFor="role-name">
              Role name <span className="text-orange-500">*</span>
            </Label>
            <Input
              id="role-name"
              placeholder="e.g. MANAGER"
              className="h-10 uppercase"
              disabled={isSubmitting}
              {...register("roleName")}
            />
            {errors.roleName ? (
              <p className="text-xs text-destructive">{errors.roleName.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role-shopId">
              Shop ID{" "}
              {mode === "add" ? (
                <span className="text-orange-500">*</span>
              ) : null}
            </Label>
            <Input
              id="role-shopId"
              type="number"
              min={1}
              placeholder={mode === "add" ? "e.g. 1" : "Optional — leave empty for all shops"}
              className="h-10"
              disabled={isSubmitting}
              {...register("shopId")}
            />
            {"shopId" in errors && errors.shopId ? (
              <p className="text-xs text-destructive">{String(errors.shopId.message)}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role-description">Description</Label>
            <Input
              id="role-description"
              placeholder="Short description of permissions"
              className="h-10"
              disabled={isSubmitting}
              {...register("description")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role-status">
              Status <span className="text-orange-500">*</span>
            </Label>
            <select
              id="role-status"
              className="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
              disabled={isSubmitting}
              {...register("status")}
            >
              <option value="active">active</option>
              <option value="inactive">inactive</option>
            </select>
            {errors.status ? (
              <p className="text-xs text-destructive">{errors.status.message}</p>
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
              className="border-0 bg-orange-500 font-semibold text-white hover:bg-orange-600 hover:text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving…
                </>
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
