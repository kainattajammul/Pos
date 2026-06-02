"use client";

import Link from "next/link";
import { ChevronRight, Pencil } from "lucide-react";

interface EstimateHeaderProps {
  estimateNumber: string;
  onEditNumber?: () => void;
}

export function EstimateHeader({ estimateNumber, onEditNumber }: EstimateHeaderProps) {
  return (
    <header className="mb-4 space-y-2">
      <nav
        className="flex flex-wrap items-center gap-1 text-sm text-(--repair-primary)"
        aria-label="Breadcrumb"
      >
        <Link href="/dashboard" className="hover:underline">
          Home
        </Link>
        <ChevronRight className="size-3.5 shrink-0 opacity-70" aria-hidden />
        <Link href="/repairs/manage-estimates" className="hover:underline">
          Estimates
        </Link>
        <ChevronRight className="size-3.5 shrink-0 opacity-70" aria-hidden />
        <span className="font-medium">{estimateNumber}</span>
      </nav>
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold text-[#111827]">Estimate {estimateNumber}</h1>
        <button
          type="button"
          onClick={onEditNumber}
          className="rounded p-1 text-[#9CA3AF] hover:bg-[#F3F4F6] hover:text-[#374151]"
          aria-label="Edit estimate number"
        >
          <Pencil className="size-4" />
        </button>
      </div>
    </header>
  );
}
