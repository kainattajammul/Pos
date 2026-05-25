"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Camera } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConditionImageWebcamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCapture: (file: File) => void;
}

export function ConditionImageWebcamDialog({
  open,
  onOpenChange,
  onCapture,
}: ConditionImageWebcamDialogProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setReady(false);
  }, []);

  useEffect(() => {
    if (!open) {
      stopCamera();
      setError(null);
      return;
    }

    let cancelled = false;

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setReady(true);
          setError(null);
        }
      } catch {
        setError(
          "Could not access the camera. Allow camera permission or upload from your computer instead.",
        );
        setReady(false);
      }
    }

    start();
    return () => {
      cancelled = true;
      stopCamera();
    };
  }, [open, stopCamera]);

  const handleCapture = () => {
    const video = videoRef.current;
    if (!video || !ready) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `webcam-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
        onCapture(file);
        onOpenChange(false);
      },
      "image/jpeg",
      0.92,
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        overlayClassName="bg-black/55"
        className="max-w-lg gap-4 p-4 sm:max-w-lg"
      >
        <DialogTitle className="text-base font-semibold text-[#111827]">
          Take photo with webcam
        </DialogTitle>

        {error ? (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        ) : (
          <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-[#111827]">
            <video
              ref={videoRef}
              playsInline
              muted
              className="size-full object-cover"
            />
            {!ready ? (
              <div className="absolute inset-0 flex items-center justify-center text-sm text-white/80">
                Starting camera…
              </div>
            ) : null}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!ready}
            onClick={handleCapture}
            className="gap-1.5 border-0 text-[var(--repair-on-primary)] hover:opacity-90"
            style={{ backgroundColor: "var(--repair-primary)" }}
          >
            <Camera className="size-4" />
            Capture photo
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
