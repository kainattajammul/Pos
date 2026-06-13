import Link from "next/link";
import type { ReactNode } from "react";

interface BranchPageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: { label: string; href?: string }[];
  actions?: ReactNode;
}

export function BranchPageHeader({
  title,
  description,
  breadcrumbs = [
    { label: "Home", href: "/dashboard" },
    { label: "Branches", href: "/branches" },
  ],
  actions,
}: BranchPageHeaderProps) {
  return (
    <header className="rounded-sm border border-[#E5E7EB] bg-white px-5 py-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-[#111827] md:text-2xl">{title}</h1>
          {description ? (
            <p className="max-w-2xl text-sm text-[#6B7280]">{description}</p>
          ) : null}
          <nav className="text-sm text-[#6B7280]" aria-label="Breadcrumb">
            {breadcrumbs.map((crumb, index) => (
              <span key={`${crumb.label}-${index}`}>
                {index > 0 ? <span className="mx-1.5 text-[#9CA3AF]">/</span> : null}
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    className="font-medium text-[#31A5A6] transition-colors hover:text-[#227E7F] hover:underline"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="font-medium text-[#374151]">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
    </header>
  );
}
