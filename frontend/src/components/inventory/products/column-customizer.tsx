"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type { DragEvent } from "react";
import { GripVertical, Settings2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

export interface ColumnMeta {
  id: string;
  label: string;
  /** columns that cannot be toggled (select, actions) */
  fixed?: boolean;
}

interface ColumnCustomizerProps {
  columns: ColumnMeta[];
  /** ordered list of currently visible + hidden column ids */
  columnOrder: string[];
  /** set of hidden column ids */
  hiddenColumns: Set<string>;
  onSave: (order: string[], hidden: Set<string>) => void;
}

export function ColumnCustomizer({
  columns,
  columnOrder,
  hiddenColumns,
  onSave,
}: ColumnCustomizerProps) {
  const [open, setOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // local draft state — only committed on Save
  const [draftOrder, setDraftOrder] = useState<string[]>([]);
  const [draftHidden, setDraftHidden] = useState<Set<string>>(new Set());

  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // sync draft when opening
  useEffect(() => {
    if (open) {
      setDraftOrder([...columnOrder]);
      setDraftHidden(new Set(hiddenColumns));
    }
  }, [open, columnOrder, hiddenColumns]);

  // close on outside click
  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // --- drag-and-drop ---
  const dragIdRef = useRef<string | null>(null);

  const handleDragStart = useCallback(
    (e: DragEvent<HTMLLIElement>, id: string) => {
      dragIdRef.current = id;
      e.dataTransfer.effectAllowed = "move";
    },
    [],
  );

  const handleDragOver = useCallback((e: DragEvent<HTMLLIElement>, id: string) => {
    e.preventDefault();
    const dragId = dragIdRef.current;
    if (!dragId || dragId === id) return;
    setDraftOrder((prev) => {
      const next = [...prev];
      const from = next.indexOf(dragId);
      const to = next.indexOf(id);
      if (from === -1 || to === -1) return prev;
      next.splice(from, 1);
      next.splice(to, 0, dragId);
      return next;
    });
  }, []);

  const handleDragEnd = useCallback(() => {
    dragIdRef.current = null;
  }, []);

  // ordered list of non-fixed columns for the panel
  const orderedMeta = draftOrder
    .map((id) => columns.find((c) => c.id === id))
    .filter((c): c is ColumnMeta => !!c && !c.fixed);

  function toggleHidden(id: string) {
    const next = new Set(draftHidden);
    if (next.has(id)) next.delete(id);
    else next.add(id);

    setDraftHidden(next);
    // Apply visibility instantly when checkbox changes.
    onSave(draftOrder, next);
  }

  function handleSave() {
    onSave(draftOrder, draftHidden);
    setOpen(false);
  }

  return (
    <div className="relative inline-flex items-center">
      {/* Teal tooltip */}
      {showTooltip && !open && (
        <div
          role="tooltip"
          className="pointer-events-none absolute bottom-full right-0 z-50 mb-2 w-52 rounded-md bg-primary px-3 py-2 text-xs leading-relaxed text-primary-foreground shadow-lg"
        >
          Customize your columns display by drag and drop to rearrange the
          order and uncheck the columns name from the dropdown menu to hide.
          {/* arrow */}
          <span className="absolute -bottom-1.5 right-3 size-3 rotate-45 bg-primary" />
        </div>
      )}

      {/* Gear trigger */}
      <button
        ref={triggerRef}
        type="button"
        aria-label="Customize columns"
        aria-expanded={open}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => {
          setShowTooltip(false);
          setOpen((v) => !v);
        }}
        className={cn(
          "flex size-7 items-center justify-center rounded transition-colors",
          open
            ? "bg-primary/10 text-primary"
            : "text-primary hover:bg-primary/10",
        )}
      >
        <Settings2 className="size-4" strokeWidth={1.75} />
      </button>

      {/* Drop-down panel */}
      {open && (
        <div
          ref={panelRef}
          className="absolute right-0 top-full z-50 mt-1 w-52 rounded-lg border-2 border-primary/70 bg-white shadow-lg"
        >
          {/* scrollable rows */}
          <ul className="max-h-60 overflow-y-auto px-1 py-1.5">
            {orderedMeta.map((col) => {
              const visible = !draftHidden.has(col.id);
              return (
                <li
                  key={col.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, col.id)}
                  onDragOver={(e) => handleDragOver(e, col.id)}
                  onDragEnd={handleDragEnd}
                  className={cn(
                    "group flex cursor-grab items-center gap-2 rounded px-2 py-1.5 text-sm transition-colors select-none",
                    "hover:bg-primary/10 active:cursor-grabbing",
                  )}
                >
                  {/* drag handle */}
                  <GripVertical className="size-3.5 shrink-0 text-neutral-300 group-hover:text-primary" />

                  {/* checkbox */}
                  <Checkbox
                    checked={visible}
                    onCheckedChange={() => toggleHidden(col.id)}
                    aria-label={`Toggle ${col.label}`}
                    className="shrink-0 border-neutral-300 data-checked:border-primary data-checked:bg-primary"
                  />

                  <span
                    className={cn(
                      "flex-1 truncate font-medium",
                      visible ? "text-neutral-800" : "text-neutral-400 line-through",
                    )}
                  >
                    {col.label}
                  </span>
                </li>
              );
            })}
          </ul>

          {/* Save footer */}
          <div className="flex justify-end border-t border-neutral-100 px-3 py-2">
            <button
              type="button"
              onClick={handleSave}
              className="rounded bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
