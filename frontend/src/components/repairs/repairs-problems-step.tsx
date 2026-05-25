"use client";

import { useMemo, useState } from "react";
import { Check, ChevronRight, Plus, Search } from "lucide-react";
import { RepairProblemIconMark } from "@/components/repairs/repair-problem-icon";
import {
  DEFAULT_REPAIR_PROBLEMS,
  formatRepairProblemPrice,
  type RepairProblem,
} from "@/lib/repairs-problems-data";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RepairsProblemsStepProps {
  selectedProblemIds: string[];
  onToggleProblem: (problemId: string) => void;
  onNext: () => void;
  onAddIssue?: () => void;
}

export function RepairsProblemsStep({
  selectedProblemIds,
  onToggleProblem,
  onNext,
  onAddIssue,
}: RepairsProblemsStepProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return DEFAULT_REPAIR_PROBLEMS;
    return DEFAULT_REPAIR_PROBLEMS.filter(
      (p) => p.isAdd || p.name.toLowerCase().includes(q),
    );
  }, [query]);

  const handleCardClick = (problem: RepairProblem) => {
    if (problem.isAdd) {
      onAddIssue?.();
      return;
    }
    onToggleProblem(problem.id);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-4 flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search device problem"
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

      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5">
          {filtered.map((problem) => (
            <ProblemCard
              key={problem.id}
              problem={problem}
              selected={selectedProblemIds.includes(problem.id)}
              onClick={() => handleCardClick(problem)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ProblemCard({
  problem,
  selected,
  onClick,
}: {
  problem: RepairProblem;
  selected: boolean;
  onClick: () => void;
}) {
  if (problem.isAdd) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="flex min-h-[148px] flex-col items-center justify-center gap-2 rounded-lg p-3 text-[var(--repair-on-primary)] shadow-sm transition-transform hover:scale-[1.01] hover:shadow-md"
        style={{
          background: `linear-gradient(180deg, var(--repair-primary) 0%, var(--repair-accent-end) 100%)`,
        }}
      >
        <div className="flex size-10 items-center justify-center rounded-full bg-white/25">
          <Plus className="size-6" strokeWidth={2.5} />
        </div>
        <span className="text-center text-xs font-semibold leading-tight">
          {problem.name}
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "relative flex min-h-[148px] flex-col items-center rounded-lg border bg-white px-2 pb-3 pt-8 shadow-sm transition-all",
        "hover:border-[var(--repair-primary)] hover:shadow-md",
        selected
          ? "border-2 border-[var(--repair-primary)] bg-[color-mix(in_srgb,var(--repair-primary)_8%,white)] ring-1 ring-[var(--repair-primary)]/20"
          : "border-[#E5E7EB]",
      )}
    >
      <span
        className={cn(
          "absolute top-2 left-2 flex size-4 items-center justify-center rounded border transition-colors",
          selected
            ? "border-[var(--repair-primary)] bg-[var(--repair-primary)] text-[var(--repair-on-primary)]"
            : "border-[#D1D5DB] bg-white",
        )}
        aria-hidden
      >
        {selected ? <Check className="size-3 stroke-[3]" /> : null}
      </span>

      <RepairProblemIconMark icon={problem.icon} className="mb-2" />

      <span className="line-clamp-3 flex-1 px-1 text-center text-xs font-medium leading-snug text-[#111827]">
        {problem.name}
      </span>

      <span className="mt-2 text-sm font-semibold text-[var(--repair-primary)]">
        {formatRepairProblemPrice(problem.price)}
      </span>
    </button>
  );
}
