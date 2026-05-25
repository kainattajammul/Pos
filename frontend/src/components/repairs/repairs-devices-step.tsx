"use client";

import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import type { RepairDevice } from "@/lib/repairs-pos-data";
import { DevicePreviewIcon } from "@/components/repairs/device-preview-icon";
import { cn } from "@/lib/utils";

interface RepairsDevicesStepProps {
  devices: RepairDevice[];
  categoryId?: string | null;
  selectedDeviceId: string | null;
  onSelectDevice: (deviceId: string) => void;
}

export function RepairsDevicesStep({
  devices,
  categoryId,
  selectedDeviceId,
  onSelectDevice,
}: RepairsDevicesStepProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return devices;
    return devices.filter(
      (d) => d.isAdd || d.name.toLowerCase().includes(q),
    );
  }, [devices, query]);

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
              key={device.id}
              device={device}
              categoryId={categoryId}
              selected={selectedDeviceId === device.id}
              onSelect={() => onSelectDevice(device.id)}
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
}: {
  device: RepairDevice;
  categoryId?: string | null;
  selected: boolean;
  onSelect: () => void;
}) {
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
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex min-h-[130px] flex-col overflow-hidden rounded-lg border bg-white shadow-sm transition-all",
        "hover:border-[var(--repair-primary)] hover:shadow-md",
        selected
          ? "border-2 border-[var(--repair-primary)] ring-1 ring-[var(--repair-primary)]/20"
          : "border-[#E5E7EB]",
      )}
    >
      <DevicePreviewIcon
        deviceName={device.name}
        categoryId={categoryId}
        className="rounded-t-lg"
      />
      <span className="border-t border-[#F3F4F6] px-2 py-2.5 text-center text-xs font-medium leading-tight text-[#111827]">
        {device.name}
      </span>
    </button>
  );
}
