"use client";

import { useMemo, useState } from "react";
import { MoreHorizontal, Pencil, Plus, Search, Trash2 } from "lucide-react";
import type { RepairDevice } from "@/lib/repairs-devices-data";
import { DevicePreviewIcon } from "@/components/repairs/device-preview-icon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface RepairsDevicesStepProps {
  devices: RepairDevice[];
  categoryId?: string | null;
  selectedDeviceId: string | null;
  devicesLoading?: boolean;
  onSelectDevice: (deviceId: string) => void;
  onAddDevice?: () => void;
  onEditDevice?: (device: RepairDevice) => void;
  onDeleteDevice?: (device: RepairDevice) => void;
}

export function RepairsDevicesStep({
  devices,
  categoryId,
  selectedDeviceId,
  devicesLoading = false,
  onSelectDevice,
  onAddDevice,
  onEditDevice,
  onDeleteDevice,
}: RepairsDevicesStepProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return devices;
    return devices.filter(
      (d) => d.isAdd || d.name.toLowerCase().includes(q),
    );
  }, [devices, query]);

  if (devicesLoading) {
    return (
      <div className="flex min-h-[200px] flex-1 items-center justify-center text-sm text-[#6B7280]">
        Loading devices…
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="relative mb-4 shrink-0">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search device"
          className="h-10 w-full rounded-md border border-[#E5E7EB] bg-white pr-10 pl-3 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:border-[var(--repair-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--repair-primary)]"
        />
        <Search
          className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-[#9CA3AF]"
          aria-hidden
        />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5">
          {filtered.map((device) => (
            <DeviceCard
              key={device.isAdd ? "add" : String(device.dbId ?? device.id)}
              device={device}
              categoryId={categoryId}
              selected={selectedDeviceId === device.id}
              onSelect={() => {
                if (device.isAdd) {
                  onAddDevice?.();
                  return;
                }
                onSelectDevice(device.id);
              }}
              onEdit={onEditDevice}
              onDelete={onDeleteDevice}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function DeviceCard({
  device,
  categoryId,
  selected,
  onSelect,
  onEdit,
  onDelete,
}: {
  device: RepairDevice;
  categoryId?: string | null;
  selected: boolean;
  onSelect: () => void;
  onEdit?: (device: RepairDevice) => void;
  onDelete?: (device: RepairDevice) => void;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const canManage = !device.isAdd && device.dbId != null;
  const showCustomImage = Boolean(device.imageUrl) && !imageFailed;

  if (device.isAdd) {
    return (
      <button
        type="button"
        onClick={onSelect}
        className="flex min-h-[130px] flex-col items-center justify-center gap-2 rounded-lg p-3 text-[var(--repair-on-primary)] shadow-sm transition-transform hover:scale-[1.01] hover:shadow-md"
        style={{
          background: `linear-gradient(180deg, var(--repair-primary) 0%, var(--repair-accent-end) 100%)`,
        }}
      >
        <div className="flex size-10 items-center justify-center rounded-full bg-white/25">
          <Plus className="size-6" strokeWidth={2.5} />
        </div>
        <span className="text-center text-xs font-semibold leading-tight">
          {device.name}
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
            aria-label={`Actions for ${device.name}`}
          >
            <MoreHorizontal className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            {onEdit ? (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(device);
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
                  onDelete(device);
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
        onClick={onSelect}
        className={cn(
          "flex min-h-[130px] w-full flex-col overflow-hidden rounded-lg border bg-white shadow-sm transition-all",
          "hover:border-[var(--repair-primary)] hover:shadow-md",
          selected
            ? "border-2 border-[var(--repair-primary)] ring-1 ring-[var(--repair-primary)]/20"
            : "border-[#E5E7EB]",
        )}
      >
        {showCustomImage ? (
          <div className="flex h-[88px] w-full items-center justify-center bg-[#F3F4F6] px-2 py-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={device.imageUrl}
              alt=""
              role="presentation"
              className="max-h-[72px] max-w-full object-contain"
              onError={() => setImageFailed(true)}
            />
          </div>
        ) : (
          <DevicePreviewIcon
            deviceName={device.name}
            categoryId={categoryId}
            iconVariant={device.iconVariant}
            className="rounded-t-lg"
          />
        )}
        <span className="border-t border-[#F3F4F6] px-2 py-2.5 text-center text-xs font-medium leading-tight text-[#111827]">
          {device.name}
        </span>
      </button>
    </div>
  );
}
