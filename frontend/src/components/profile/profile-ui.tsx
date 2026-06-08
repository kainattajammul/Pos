import { cn } from "@/lib/utils";

export function ProfileGlassCard({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-2xl border border-[#E5E7EB]/80 bg-white/95 shadow-[0_8px_24px_rgba(15,23,42,0.06)] backdrop-blur-sm",
        "dark:border-white/10 dark:bg-[#101014]/85 dark:shadow-[0_8px_24px_rgba(0,0,0,0.35)]",
        className,
      )}
    >
      <div className="border-b border-[#E5E7EB]/80 px-5 py-4 dark:border-white/10">
        <h2 className="text-base font-semibold text-[#111827] dark:text-[#f4f4f5]">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 text-sm text-[#6B7280] dark:text-white/65">{description}</p>
        ) : null}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

export function ProfileFieldGrid({
  fields,
}: {
  fields: Array<{ label: string; value: string | null | undefined }>;
}) {
  const visible = fields.filter((field) => field.value !== undefined);

  return (
    <dl className="grid gap-4 sm:grid-cols-2">
      {visible.map((field) => (
        <div key={field.label} className="min-w-0">
          <dt className="text-xs font-semibold uppercase tracking-wide text-[#6B7280] dark:text-white/55">
            {field.label}
          </dt>
          <dd className="mt-1 text-sm font-medium text-[#111827] dark:text-[#f4f4f5]">
            {field.value?.trim() ? field.value : "Not provided"}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function ProfileStatusBadge({
  status,
}: {
  status: string;
}) {
  const active = status.toLowerCase() === "active";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        active
          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
          : "bg-[#F3F4F6] text-[#6B7280] dark:bg-white/10 dark:text-white/75",
      )}
    >
      {status}
    </span>
  );
}
