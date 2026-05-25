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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CUSTOMER_GROUP_OPTIONS,
  NEW_CUSTOMER_DEFAULTS,
  TAX_CLASS_OPTIONS,
} from "@/lib/repairs-customer-data";
import { customerRowToFormValues } from "@/services/customers.service";
import type { CustomerFormValues, CustomerTableRow } from "@/types/customer-table";

const customerSchema = z.object({
  customerGroup: z.string().min(1),
  taxClass: z.string(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string(),
  email: z.union([
    z.literal(""),
    z.string().email("Enter a valid email"),
  ]),
  phoneCountryCode: z.string(),
  phone: z.string(),
  addressLine1: z.string(),
  addressLine2: z.string(),
  city: z.string(),
  state: z.string(),
  zip: z.string(),
  country: z.string(),
  status: z.enum(["active", "inactive"]),
});

type CustomerFormFields = z.infer<typeof customerSchema>;

interface CustomerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit";
  customer: CustomerTableRow | null;
  isSubmitting?: boolean;
  onSave: (values: CustomerFormValues) => void;
}

export function CustomerFormDialog({
  open,
  onOpenChange,
  mode,
  customer,
  isSubmitting = false,
  onSave,
}: CustomerFormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CustomerFormFields>({
    resolver: zodResolver(customerSchema) as Resolver<CustomerFormFields>,
    defaultValues: {
      ...NEW_CUSTOMER_DEFAULTS,
      status: "active",
    },
  });

  const customerGroup = watch("customerGroup");
  const taxClass = watch("taxClass");
  const status = watch("status");

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && customer) {
      const values = customerRowToFormValues(customer);
      reset({
        ...values,
        email: values.email || "",
      });
      return;
    }
    reset({
      ...NEW_CUSTOMER_DEFAULTS,
      status: "active",
    });
  }, [open, mode, customer, reset]);

  const onSubmit = (data: CustomerFormFields) => {
    onSave({
      ...NEW_CUSTOMER_DEFAULTS,
      ...data,
      emailAlert: true,
      phoneType: "Mobile",
      hearAboutUs: "",
      additionalNotes: "",
      referralCode: "",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] gap-0 overflow-y-auto p-0 sm:max-w-lg">
        <DialogHeader className="border-b border-neutral-200 px-6 py-4">
          <DialogTitle>
            {mode === "add" ? "Add Customer" : "Edit Customer"}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5 px-6 py-5"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="customerGroup">Customer group</Label>
              <Select
                value={customerGroup}
                onValueChange={(v) => setValue("customerGroup", v ?? "Individual")}
              >
                <SelectTrigger id="customerGroup" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CUSTOMER_GROUP_OPTIONS.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="taxClass">Tax class</Label>
              <Select
                value={taxClass || "none"}
                onValueChange={(v) =>
                  setValue("taxClass", v === "none" ? "" : (v ?? ""))
                }
              >
                <SelectTrigger id="taxClass" className="w-full">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">—</SelectItem>
                  {TAX_CLASS_OPTIONS.filter(Boolean).map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">First name</Label>
              <Input id="firstName" {...register("firstName")} />
              {errors.firstName ? (
                <p className="text-xs text-destructive">{errors.firstName.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input id="lastName" {...register("lastName")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email ? (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-[100px_1fr]">
            <div className="space-y-2">
              <Label htmlFor="phoneCountryCode">Code</Label>
              <Input id="phoneCountryCode" {...register("phoneCountryCode")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" {...register("phone")} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" {...register("city")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input id="state" {...register("state")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input id="country" {...register("country")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={status}
              onValueChange={(v) =>
                setValue("status", (v as "active" | "inactive") ?? "active")
              }
            >
              <SelectTrigger id="status" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-neutral-200 pt-4 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving…
                </>
              ) : mode === "add" ? (
                "Add Customer"
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
