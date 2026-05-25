"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Eye, EyeOff } from "lucide-react";
import type { LockType } from "@/lib/repairs-details-data";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const PATTERN_GRID = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

interface RepairLockInputProps {
  lockType: LockType;
  passcode: string;
  patternLock: string;
  onPasscodeChange: (value: string) => void;
  onPatternChange: (value: string) => void;
  inputClassName?: string;
}

export function RepairLockInput({
  lockType,
  passcode,
  patternLock,
  onPasscodeChange,
  onPatternChange,
  inputClassName,
}: RepairLockInputProps) {
  if (lockType === "passcode") {
    return (
      <PasscodeInput
        value={passcode}
        onChange={onPasscodeChange}
        className={inputClassName}
      />
    );
  }

  return (
    <PatternLockInput
      value={patternLock}
      onChange={onPatternChange}
    />
  );
}

function PasscodeInput({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  const [draft, setDraft] = useState(value);
  const [showPasscode, setShowPasscode] = useState(false);
  const [saved, setSaved] = useState(Boolean(value));

  useEffect(() => {
    setDraft(value);
    setSaved(Boolean(value));
  }, [value]);

  const handleSave = () => {
    onChange(draft.trim());
    setSaved(true);
    toast.success("Passcode saved");
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <input
          type={showPasscode ? "text" : "password"}
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            setSaved(false);
          }}
          placeholder="Enter passcode"
          inputMode="numeric"
          autoComplete="off"
          className={cn(
            className,
            "pr-10",
            "disabled:pointer-events-auto disabled:opacity-100",
          )}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShowPasscode((s) => !s)}
          className="absolute top-1/2 right-3 z-10 -translate-y-1/2 text-[#9CA3AF] hover:text-[#374151]"
          aria-label={showPasscode ? "Hide passcode" : "Show passcode"}
        >
          {showPasscode ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
      <div className="flex items-center justify-between gap-2">
        {saved && value ? (
          <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
            <Check className="size-3.5" />
            Passcode saved
          </span>
        ) : (
          <span className="text-xs text-[#6B7280]">Enter passcode then save</span>
        )}
        {!saved || draft.trim() !== value ? (
          <Button
            type="button"
            size="sm"
            disabled={!draft.trim()}
            onClick={handleSave}
            className="h-8 border-0 px-3 text-xs font-semibold text-[var(--repair-on-primary)] hover:opacity-90"
            style={{ backgroundColor: "var(--repair-primary)" }}
          >
            Save Passcode
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function PatternLockInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dotRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const [draft, setDraft] = useState<number[]>(() => parsePattern(value));
  const [editorOpen, setEditorOpen] = useState(() => !value.trim());
  const isDrawingRef = useRef(false);
  const [linePoints, setLinePoints] = useState<{ x: number; y: number }[]>([]);

  useEffect(() => {
    const parsed = parsePattern(value);
    setDraft(parsed);
    if (!value.trim()) setEditorOpen(true);
  }, [value]);

  const updateLines = useCallback(() => {
    const container = containerRef.current;
    if (!container || draft.length === 0) {
      setLinePoints([]);
      return;
    }
    const rect = container.getBoundingClientRect();
    const points = draft
      .map((id) => {
        const el = dotRefs.current.get(id);
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return {
          x: r.left + r.width / 2 - rect.left,
          y: r.top + r.height / 2 - rect.top,
        };
      })
      .filter((p): p is { x: number; y: number } => p !== null);
    setLinePoints(points);
  }, [draft]);

  useEffect(() => {
    updateLines();
    window.addEventListener("resize", updateLines);
    return () => window.removeEventListener("resize", updateLines);
  }, [updateLines]);

  const addDot = useCallback((dot: number) => {
    setDraft((prev) => {
      if (prev.includes(dot)) return prev;
      return [...prev, dot];
    });
  }, []);

  const hitTestDot = useCallback((clientX: number, clientY: number): number | null => {
    for (const id of PATTERN_GRID) {
      const el = dotRefs.current.get(id);
      if (!el) continue;
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const radius = r.width / 2 + 8;
      const dist = Math.hypot(clientX - cx, clientY - cy);
      if (dist <= radius) return id;
    }
    return null;
  }, []);

  const handlePointerDown = (dot: number, e: React.PointerEvent) => {
    e.preventDefault();
    containerRef.current?.setPointerCapture(e.pointerId);
    isDrawingRef.current = true;
    setDraft([dot]);
  };

  const handlePointerUp = useCallback(() => {
    isDrawingRef.current = false;
  }, []);

  useEffect(() => {
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);
    return () => {
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [handlePointerUp]);

  const clearDraft = () => {
    setDraft([]);
    onChange("");
    setEditorOpen(true);
  };

  const savePattern = () => {
    if (draft.length < 2) {
      toast.error("Draw a pattern with at least 2 dots");
      return;
    }
    const encoded = draft.join("-");
    onChange(encoded);
    setEditorOpen(false);
    toast.success("Pattern saved");
  };

  const savedSequence = parsePattern(value);
  const isSaved =
    savedSequence.length > 0 &&
    savedSequence.length === draft.length &&
    savedSequence.every((d, i) => d === draft[i]);

  if (!editorOpen && savedSequence.length > 0) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-lg border border-[#E5E7EB] bg-[#FAFAFA] px-4 py-3">
        <div className="min-w-0">
          <span className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600">
            <Check className="size-4 shrink-0" />
            Pattern saved
          </span>
          <p className="mt-0.5 truncate text-xs text-[#6B7280]">
            {savedSequence.join(" → ")}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setDraft(savedSequence);
              setEditorOpen(true);
            }}
            className="h-8 border-[#E5E7EB] text-xs"
          >
            Edit
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={clearDraft}
            className="h-8 border-[#E5E7EB] text-xs"
          >
            Clear
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[#E5E7EB] bg-[#FAFAFA] p-4">
      <p className="mb-3 text-center text-xs text-[#6B7280]">
        Press and drag across the dots to draw the pattern
      </p>

      <div
        ref={containerRef}
        className="relative mx-auto w-fit touch-none select-none"
        style={{ touchAction: "none" }}
        onPointerMove={(e) => {
          if (!isDrawingRef.current) return;
          const dot = hitTestDot(e.clientX, e.clientY);
          if (dot !== null) addDot(dot);
        }}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {linePoints.length > 1 ? (
          <svg
            className="pointer-events-none absolute inset-0 size-full"
            style={{ overflow: "visible" }}
          >
            <polyline
              points={linePoints.map((p) => `${p.x},${p.y}`).join(" ")}
              fill="none"
              stroke="var(--repair-primary)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : null}

        <div className="relative grid grid-cols-3 gap-4">
          {PATTERN_GRID.map((dot) => {
            const order = draft.indexOf(dot);
            const active = order >= 0;
            return (
              <div
                key={dot}
                ref={(el) => {
                  if (el) dotRefs.current.set(dot, el);
                  else dotRefs.current.delete(dot);
                }}
                role="presentation"
                onPointerDown={(e) => handlePointerDown(dot, e)}
                className={cn(
                  "flex size-12 cursor-pointer items-center justify-center rounded-full border-2 transition-colors",
                  active
                    ? "border-[var(--repair-primary)] bg-[var(--repair-primary)] text-xs font-bold text-[var(--repair-on-primary)]"
                    : "border-[#D1D5DB] bg-white hover:border-[var(--repair-primary)]",
                )}
              >
                {active ? order + 1 : null}
              </div>
            );
          })}
        </div>
      </div>

      {draft.length > 0 ? (
        <p className="mt-3 text-center text-xs text-[#6B7280]">
          Pattern: {draft.join(" → ")}
        </p>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div className="min-h-5">
          {isSaved ? (
            <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
              <Check className="size-3.5" />
              Pattern saved
            </span>
          ) : value && !isSaved ? (
            <span className="text-xs text-amber-600">Unsaved changes</span>
          ) : null}
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={clearDraft}
            disabled={draft.length === 0 && !value}
            className="h-8 border-[#E5E7EB] text-xs"
          >
            Clear
          </Button>
          {!isSaved && draft.length >= 2 ? (
            <Button
              type="button"
              size="sm"
              onClick={savePattern}
              className="h-8 border-0 px-3 text-xs font-semibold text-[var(--repair-on-primary)] hover:opacity-90"
              style={{ backgroundColor: "var(--repair-primary)" }}
            >
              Save Pattern
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function parsePattern(encoded: string): number[] {
  if (!encoded.trim()) return [];
  return encoded
    .split("-")
    .map((n) => parseInt(n, 10))
    .filter((n) => n >= 1 && n <= 9);
}
