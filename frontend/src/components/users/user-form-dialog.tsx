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
import type { UserTableRow } from "@/types/user-table";

const baseFields = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.email("Enter a valid email"),
  phone: z.string().optional(),
  roleId: z.string().optional(),
  shopId: z.string().optional(),
  status: z.enum(["active", "inactive"]),
});

const addSchema = baseFields.extend({
  password: z.string().min(8, "Password must be at least 8 characters"),
  shopId: z.string().min(1, "Shop ID is required"),
});

const editSchema = baseFields
  .omit({ roleId: true, shopId: true, status: true })
  .extend({
    password: z
      .string()
      .optional()
      .refine((v) => !v || v.trim() === "" || v.trim().length >= 8, {
        message: "Password must be at least 8 characters",
      }),
  });

type AddFormFields = z.infer<typeof addSchema>;
type EditFormFields = z.infer<typeof editSchema>;
type UserFormFields = AddFormFields | EditFormFields;

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit";
  user: UserTableRow | null;
  isSubmitting?: boolean;
  onSave: (values: {
    fullName: string;
    email: string;
    password?: string;
    phone: string | null;
    roleId: number | null;
    shopId: number | null;
    status: string;
  }) => void;
}

function parseOptionalInt(raw: string | undefined): number | null {
  const t = raw?.trim() ?? "";
  if (t === "") return null;
  const n = Number(t);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function UserFormDialog({
  open,
  onOpenChange,
  mode,
  user,
  isSubmitting = false,
  onSave,
}: UserFormDialogProps) {
  const schema = mode === "add" ? addSchema : editSchema;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserFormFields>({
    resolver: zodResolver(schema) as Resolver<UserFormFields>,
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      phone: "",
      roleId: "",
      shopId: "",
      status: "active",
    },
  });

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && user) {
      reset({
        fullName: user.fullName,
        email: user.email,
        password: "",
        phone: user.phone ?? "",
      });
    } else if (mode === "add") {
      reset({
        fullName: "",
        email: "",
        password: "",
        phone: "",
        roleId: "",
        shopId: "",
        status: "active",
      });
    }
  }, [open, mode, user, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[min(90vh,640px)] gap-0 overflow-y-auto p-0 sm:max-w-lg"
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
            const phone = values.phone?.trim() ? values.phone.trim() : null;
            const pw =
              mode === "add"
                ? (values as AddFormFields).password
                : (values as EditFormFields).password?.trim()
                  ? (values as EditFormFields).password!.trim()
                  : undefined;
            if (mode === "add" && !pw) return;

            const addValues = values as AddFormFields;
            const shopId = mode === "add" ? parseOptionalInt(addValues.shopId) : null;
            if (mode === "add" && shopId == null) return;

            onSave({
              fullName: values.fullName.trim(),
              email: values.email.trim(),
              password: pw,
              phone,
              roleId: mode === "add" ? parseOptionalInt(addValues.roleId) : null,
              shopId,
              status: mode === "add" ? addValues.status : "active",
            });
          })}
        >
          <div className="space-y-2">
            <Label htmlFor="user-fullName">
              Full name <span className="text-primary">*</span>
            </Label>
            <Input
              id="user-fullName"
              autoComplete="name"
              className="h-10"
              disabled={isSubmitting}
              {...register("fullName")}
            />
            {errors.fullName ? (
              <p className="text-xs text-destructive">{errors.fullName.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="user-email">
              Email <span className="text-primary">*</span>
            </Label>
            <Input
              id="user-email"
              type="email"
              autoComplete="email"
              className="h-10"
              disabled={isSubmitting}
              {...register("email")}
            />
            {errors.email ? (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="user-password">
              Password{" "}
              {mode === "add" ? (
                <span className="text-primary">*</span>
              ) : (
                <span className="text-muted-foreground font-normal">(optional)</span>
              )}
            </Label>
            <Input
              id="user-password"
              type="password"
              autoComplete="new-password"
              className="h-10"
              disabled={isSubmitting}
              placeholder={mode === "edit" ? "Leave blank to keep current" : ""}
              {...register("password")}
            />
            {errors.password ? (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="user-phone">Phone</Label>
            <Input
              id="user-phone"
              type="tel"
              className="h-10"
              disabled={isSubmitting}
              {...register("phone")}
            />
            {errors.phone ? (
              <p className="text-xs text-destructive">{errors.phone.message}</p>
            ) : null}
          </div>

          {mode === "add" ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="user-roleId">Role ID</Label>
                  <Input
                    id="user-roleId"
                    type="number"
                    min={1}
                    placeholder="Optional"
                    className="h-10"
                    disabled={isSubmitting}
                    {...register("roleId")}
                  />
                  <p className="text-[11px] text-muted-foreground">
                    1 Admin, 2 Manager, 3 Cashier, 4 Tech, 5 Inventory, 6 Accountant
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="user-shopId">
                    Shop ID <span className="text-primary">*</span>
                  </Label>
                  <Input
                    id="user-shopId"
                    type="number"
                    min={1}
                    className="h-10"
                    disabled={isSubmitting}
                    {...register("shopId")}
                  />
                  {"shopId" in errors && errors.shopId ? (
                    <p className="text-xs text-destructive">
                      {String(errors.shopId.message)}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="user-status">
                  Status <span className="text-primary">*</span>
                </Label>
                <select
                  id="user-status"
                  className="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
                  disabled={isSubmitting}
                  {...register("status")}
                >
                  <option value="active">active</option>
                  <option value="inactive">inactive</option>
                </select>
                {"status" in errors && errors.status ? (
                  <p className="text-xs text-destructive">{errors.status.message}</p>
                ) : null}
              </div>
            </>
          ) : null}

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
