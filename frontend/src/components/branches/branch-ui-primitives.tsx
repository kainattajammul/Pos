import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function BranchStatCard({
  label,
  value,
  hint,
  className,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-sm border border-[#E5E7EB] bg-white p-4 shadow-sm",
        className,
      )}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-[#6B7280]">{label}</p>
      <p className="mt-1 text-2xl font-bold text-[#111827]">{value}</p>
      {hint ? <p className="mt-1 text-xs text-[#9CA3AF]">{hint}</p> : null}
    </div>
  );
}

export function BranchSectionCard({
  title,
  description,
  children,
  actions,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-sm border border-[#E5E7EB] bg-white shadow-sm">
      <div className="flex flex-col gap-2 border-b border-[#E5E7EB] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-[#111827]">{title}</h2>
          {description ? <p className="mt-0.5 text-sm text-[#6B7280]">{description}</p> : null}
        </div>
        {actions}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

export function BranchFieldGrid({
  fields,
}: {
  fields: { label: string; value: ReactNode; fullWidth?: boolean }[];
}) {
  return (
    <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {fields.map((field) => (
        <div key={field.label} className={field.fullWidth ? "sm:col-span-2" : undefined}>
          <dt className="text-xs font-medium uppercase tracking-wide text-[#6B7280]">
            {field.label}
          </dt>
          <dd className="mt-1 text-sm font-medium text-[#111827]">{field.value ?? "—"}</dd>
        </div>
      ))}
    </dl>
  );
}

export const branchInputClass =
  "h-10 w-full rounded-md border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:border-(--repair-primary) focus:outline-none focus:ring-1 focus:ring-(--repair-primary)";

export const branchSelectClass =
  "h-10 w-full appearance-none rounded-md border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] focus:border-(--repair-primary) focus:outline-none focus:ring-1 focus:ring-(--repair-primary)";

export const branchTextareaClass =
  "min-h-[88px] w-full rounded-md border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:border-(--repair-primary) focus:outline-none focus:ring-1 focus:ring-(--repair-primary)";
