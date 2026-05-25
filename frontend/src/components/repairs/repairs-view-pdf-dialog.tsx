"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Download,
  Menu,
  Minus,
  MoreVertical,
  Plus,
  Printer,
  RotateCw,
  X,
} from "lucide-react";
import type { RepairTicketSnapshot } from "@/lib/repair-ticket-snapshot";
import {
  generateRepairTicketPdf,
  getRepairTicketPdfFilename,
  type RepairTicketPdfKind,
} from "@/lib/repair-ticket-pdf";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2;
const ZOOM_STEP = 0.1;

interface RepairsViewPdfDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kind: RepairTicketPdfKind | null;
  snapshot: RepairTicketSnapshot | null;
}

export function RepairsViewPdfDialog({
  open,
  onOpenChange,
  kind,
  snapshot,
}: RepairsViewPdfDialogProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const blobRef = useRef<Blob | null>(null);

  const revokeUrl = useCallback((url: string | null) => {
    if (url) URL.revokeObjectURL(url);
  }, []);

  useEffect(() => {
    if (!open || !kind || !snapshot) {
      setPdfUrl((prev) => {
        revokeUrl(prev);
        return null;
      });
      blobRef.current = null;
      setZoom(1);
      setRotation(0);
      return;
    }

    let cancelled = false;
    let objectUrl: string | null = null;
    setLoading(true);

    generateRepairTicketPdf(snapshot, kind)
      .then((blob) => {
        if (cancelled) return;
        blobRef.current = blob;
        objectUrl = URL.createObjectURL(blob);
        setPdfUrl((prev) => {
          revokeUrl(prev);
          return objectUrl;
        });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      if (objectUrl) revokeUrl(objectUrl);
    };
  }, [open, kind, snapshot, revokeUrl]);

  const handleDownload = () => {
    if (!pdfUrl || !snapshot || !kind) return;
    const anchor = document.createElement("a");
    anchor.href = pdfUrl;
    anchor.download = getRepairTicketPdfFilename(snapshot, kind);
    anchor.click();
  };

  const handlePrint = () => {
    const frame = iframeRef.current;
    if (!frame?.contentWindow) return;
    frame.contentWindow.focus();
    frame.contentWindow.print();
  };

  const toolbarButtonClass =
    "flex size-8 items-center justify-center rounded text-[#E5E7EB] transition-colors hover:bg-white/10 disabled:opacity-40";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-black/55 supports-backdrop-filter:backdrop-blur-[2px]"
        className="flex h-[min(92vh,820px)] w-[calc(100%-1.5rem)] max-w-4xl flex-col gap-0 overflow-hidden rounded-lg border border-[#E5E7EB] bg-white p-0 shadow-2xl sm:max-w-4xl"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-[#E5E7EB] px-4 py-3">
          <DialogTitle className="text-base font-semibold text-[#111827]">
            View PDF
          </DialogTitle>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-md p-1 text-[#6B7280] transition-colors hover:bg-[#F3F4F6] hover:text-[#111827]"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex shrink-0 items-center gap-1 bg-[#323639] px-2 py-1.5 text-white">
          <button type="button" className={toolbarButtonClass} aria-label="Menu">
            <Menu className="size-4" />
          </button>
          <span className="min-w-[52px] px-2 text-center text-xs text-[#E5E7EB]">
            1 / 1
          </span>
          <button
            type="button"
            className={toolbarButtonClass}
            aria-label="Zoom out"
            disabled={zoom <= MIN_ZOOM}
            onClick={() => setZoom((z) => Math.max(MIN_ZOOM, z - ZOOM_STEP))}
          >
            <Minus className="size-4" />
          </button>
          <button
            type="button"
            className={toolbarButtonClass}
            aria-label="Zoom in"
            disabled={zoom >= MAX_ZOOM}
            onClick={() => setZoom((z) => Math.min(MAX_ZOOM, z + ZOOM_STEP))}
          >
            <Plus className="size-4" />
          </button>
          <button
            type="button"
            className={toolbarButtonClass}
            aria-label="Rotate"
            onClick={() => setRotation((r) => (r + 90) % 360)}
          >
            <RotateCw className="size-4" />
          </button>
          <div className="flex-1" />
          <button
            type="button"
            className={toolbarButtonClass}
            aria-label="Download PDF"
            disabled={!pdfUrl}
            onClick={handleDownload}
          >
            <Download className="size-4" />
          </button>
          <button
            type="button"
            className={toolbarButtonClass}
            aria-label="Print PDF"
            disabled={!pdfUrl}
            onClick={handlePrint}
          >
            <Printer className="size-4" />
          </button>
          <button type="button" className={toolbarButtonClass} aria-label="More options">
            <MoreVertical className="size-4" />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 bg-[#525659]">
          <aside className="hidden w-[120px] shrink-0 flex-col border-r border-[#3d4043] bg-[#3d4043] p-3 sm:flex">
            <div
              className={cn(
                "overflow-hidden rounded border-2 bg-white shadow-md",
                pdfUrl ? "border-white" : "border-transparent opacity-60",
              )}
            >
              {pdfUrl ? (
                <iframe
                  title="PDF thumbnail"
                  src={`${pdfUrl}#page=1&zoom=page-fit`}
                  className="pointer-events-none h-[140px] w-full border-0 bg-white"
                />
              ) : (
                <div className="flex h-[140px] items-center justify-center bg-[#F3F4F6] text-[10px] text-[#6B7280]">
                  …
                </div>
              )}
            </div>
            <p className="mt-2 text-center text-[10px] text-[#D1D5DB]">1</p>
          </aside>

          <div className="flex min-h-0 flex-1 items-start justify-center overflow-auto p-4 md:p-6">
            {loading ? (
              <p className="text-sm text-[#E5E7EB]">Generating PDF…</p>
            ) : pdfUrl ? (
              <div
                className="origin-top shadow-2xl transition-transform duration-150"
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                }}
              >
                <iframe
                  ref={iframeRef}
                  title="PDF preview"
                  src={pdfUrl}
                  className={cn(
                    "border-0 bg-white shadow-lg",
                    kind === "thermal"
                      ? "h-[min(72vh,640px)] w-[min(280px,80vw)]"
                      : "h-[min(52vh,320px)] w-[min(520px,92vw)]",
                  )}
                />
              </div>
            ) : (
              <p className="text-sm text-[#E5E7EB]">Unable to load document.</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
