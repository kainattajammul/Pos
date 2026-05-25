"use client";

import { useMemo, useState } from "react";
import {
  Check,
  ChevronRight,
  Info,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { RepairPartPreview } from "@/components/repairs/repair-part-preview";
import {
  formatRepairPartPrice,
  type RepairPart,
} from "@/lib/repairs-parts-data";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface RepairsPartsStepProps {
  parts: RepairPart[];
  partsLoading?: boolean;
  selectedPartIds: string[];
  onTogglePart: (partId: string) => void;
  onNext: () => void;
  onAddPart?: () => void;
  onEditPart?: (part: RepairPart) => void;
  onDeletePart?: (part: RepairPart) => void;
  onViewStores?: (partId: string) => void;
}

export function RepairsPartsStep({
  parts,
  partsLoading = false,
  selectedPartIds,
  onTogglePart,
  onNext,
  onAddPart,
  onEditPart,
  onDeletePart,
  onViewStores,
}: RepairsPartsStepProps) {
  const [query, setQuery] = useState("");
  const [saveBundle, setSaveBundle] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return parts;
    return parts.filter((p) => p.isAdd || p.name.toLowerCase().includes(q));
  }, [parts, query]);

  const handleCardClick = (part: RepairPart) => {
    if (part.isAdd) {
      onAddPart?.();
      return;
    }
    onTogglePart(part.id);
  };

  if (partsLoading) {
    return (
      <div className="flex min-h-[200px] flex-1 items-center justify-center text-sm text-[#6B7280]">
        Loading repair parts…
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-3 flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Part or scan barcode"
            className="h-10 w-full rounded-md border border-[#E5E7EB] bg-white pr-10 pl-3 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:border-[var(--repair-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--repair-primary)]"
          />
          <Search
            className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-[#9CA3AF]"
            aria-hidden
          />
        </div>
        <Button
          type="button"
          onClick={onNext}
          className="h-10 shrink-0 gap-1 rounded-md border-0 px-5 text-sm font-semibold text-[var(--repair-on-primary)] shadow-sm hover:opacity-90"
          style={{ backgroundColor: "var(--repair-primary)" }}
        >
          Next
          <ChevronRight className="size-4" aria-hidden />
        </Button>
      </div>

      <label className="mb-4 flex shrink-0 cursor-pointer items-center gap-2 text-sm text-[#374151]">
        <Checkbox
          checked={saveBundle}
          onCheckedChange={(checked) => setSaveBundle(checked === true)}
        />
        <span>Save item bundle for future</span>
        <span
          className="inline-flex text-[#9CA3AF]"
          title="Save the selected parts as a reusable bundle for this repair type."
        >
          <Info className="size-4" aria-hidden />
          <span className="sr-only">More information</span>
        </span>
      </label>

      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4">
          {filtered.map((part) => (
            <PartCard
              key={part.isAdd ? "add" : String(part.dbId ?? part.id)}
              part={part}
              selected={selectedPartIds.includes(part.id)}
              onClick={() => handleCardClick(part)}
              onEdit={onEditPart}
              onDelete={onDeletePart}
              onViewStores={
                part.isAdd ? undefined : () => onViewStores?.(part.id)
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function PartCard({
  part,
  selected,
  onClick,
  onEdit,
  onDelete,
  onViewStores,
}: {
  part: RepairPart;
  selected: boolean;
  onClick: () => void;
  onEdit?: (part: RepairPart) => void;
  onDelete?: (part: RepairPart) => void;
  onViewStores?: () => void;
}) {
  const canManage = !part.isAdd && part.dbId != null;
  const [imageFailed, setImageFailed] = useState(false);
  const showUploadedImage = Boolean(part.imageUrl) && !imageFailed;

  if (part.isAdd) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="flex min-h-[220px] flex-col items-center justify-center gap-2 rounded-lg p-3 text-[var(--repair-on-primary)] shadow-sm transition-transform hover:scale-[1.01] hover:shadow-md"
        style={{
          background: `linear-gradient(180deg, var(--repair-primary) 0%, var(--repair-accent-end) 100%)`,
        }}
      >
        <div className="flex size-10 items-center justify-center rounded-full bg-white/25">
          <Plus className="size-6" strokeWidth={2.5} />
        </div>
        <span className="text-center text-xs font-semibold leading-tight">
          {part.name}
        </span>
      </button>
    );
  }

  return (
    <div className="group relative">
      {canManage && (onEdit || onDelete) ? (
        <DropdownMenu>
          <DropdownMenuTrigger
            type="button"
            className="absolute top-2 right-2 z-10 flex size-7 items-center justify-center rounded-md bg-white/90 text-[#6B7280] opacity-0 shadow-sm ring-1 ring-[#E5E7EB] transition-opacity group-hover:opacity-100 hover:text-[#111827] data-popup-open:opacity-100"
            onClick={(e) => e.stopPropagation()}
            aria-label={`Actions for ${part.name}`}
          >
            <MoreHorizontal className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            {onEdit ? (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(part);
                }}
              >
                <Pencil className="size-4" />
                Edit
              </DropdownMenuItem>
            ) : null}
            {onDelete ? (
              <DropdownMenuItem
                variant="destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(part);
                }}
              >
                <Trash2 className="size-4" />
                Delete
              </DropdownMenuItem>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}

      <button
        type="button"
        onClick={onClick}
        aria-pressed={selected}
        className={cn(
          "relative flex min-h-[220px] w-full flex-col overflow-hidden rounded-lg border bg-white text-left shadow-sm transition-all",
          "hover:border-[var(--repair-primary)] hover:shadow-md",
          selected
            ? "border-2 border-[var(--repair-primary)] bg-[color-mix(in_srgb,var(--repair-primary)_8%,white)] ring-1 ring-[var(--repair-primary)]/20"
            : "border-[#E5E7EB]",
        )}
      >
        <span
          className={cn(
            "absolute top-2 left-2 z-10 flex size-4 items-center justify-center rounded border transition-colors",
            selected
              ? "border-[var(--repair-primary)] bg-[var(--repair-primary)] text-[var(--repair-on-primary)]"
              : "border-[#D1D5DB] bg-white",
          )}
          aria-hidden
        >
          {selected ? <Check className="size-3 stroke-[3]" /> : null}
        </span>

        {showUploadedImage ? (
          <div className="flex h-[72px] w-full shrink-0 items-center justify-center border-b border-[#F3F4F6] bg-[#F9FAFB] px-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={part.imageUrl!}
              alt=""
              className="max-h-[64px] max-w-full object-contain"
              onError={() => setImageFailed(true)}
            />
          </div>
        ) : (
          <RepairPartPreview variant={part.image} className="shrink-0 border-b border-[#F3F4F6]" />
        )}

        <div className="flex flex-1 flex-col px-2 pb-2 pt-2">
          <span className="line-clamp-2 text-xs font-medium leading-snug text-[#111827]">
            {part.name}
          </span>

          <span className="mt-1 text-sm font-semibold text-[var(--repair-primary)]">
            {formatRepairPartPrice(part.price)}
          </span>

          <span className="mt-1 text-[11px] text-[#6B7280]">
            On Hand: {part.onHand}
          </span>

          <span
            role="link"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              onViewStores?.();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                e.stopPropagation();
                onViewStores?.();
              }
            }}
            className="mt-1.5 cursor-pointer text-[11px] font-medium text-[var(--repair-primary)] underline underline-offset-2 hover:opacity-80"
          >
            View on hand across all stores
          </span>
        </div>
      </button>
    </div>
  );
}
