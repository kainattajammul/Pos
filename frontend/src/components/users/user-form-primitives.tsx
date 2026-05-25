"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export const inputClass = "h-9 border-neutral-200 bg-white text-sm shadow-none";

export function FormSection({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-lg border border-neutral-200/90 bg-white shadow-sm",
        className,
      )}
    >
      <div className="border-b border-neutral-100 px-4 py-3 md:px-5">
        <h2 className="text-sm font-semibold text-neutral-800">{title}</h2>
      </div>
      <div className="space-y-4 px-4 py-4 md:px-5 md:py-5">{children}</div>
    </section>
  );
}

export function Field({
  label,
  required,
  error,
  children,
  className,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="text-xs font-medium text-neutral-700">
        {label}
        {required ? <span className="text-primary"> *</span> : null}
      </Label>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

export function FieldGrid({
  children,
  cols = 4,
}: {
  children: React.ReactNode;
  cols?: 2 | 3 | 4;
}) {
  const colClass =
    cols === 2
      ? "sm:grid-cols-2"
      : cols === 3
        ? "sm:grid-cols-2 lg:grid-cols-3"
        : "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
  return <div className={cn("grid grid-cols-1 gap-4", colClass)}>{children}</div>;
}

export function CheckboxField({
  id,
  label,
  checked,
  onCheckedChange,
  disabled,
}: {
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 pt-1">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(v) => onCheckedChange(Boolean(v))}
        disabled={disabled}
      />
      <Label htmlFor={id} className="cursor-pointer text-sm font-normal text-neutral-700">
        {label}
      </Label>
    </div>
  );
}
