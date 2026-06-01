"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Layers,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
  UserMinus,
} from "lucide-react";
import type { RepairDevice } from "@/lib/repairs-devices-data";
import type { RepairDeviceSeries } from "@/lib/repairs-series-data";
import { DevicePreviewIcon } from "@/components/repairs/device-preview-icon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RepairsSeriesDevicesStepProps {
  series: RepairDeviceSeries[];
  seriesLoading?: boolean;
  devicesLoading?: boolean;
  devices: RepairDevice[];
  manufacturerName: string;
  categoryId?: string | null;
  selectedDeviceId: string | null;
  onSelectDevice: (deviceId: string) => void;
  onAddDevice?: (seriesDbId?: number) => void;
  onEditDevice?: (device: RepairDevice) => void;
  onDeleteDevice?: (device: RepairDevice) => void;
  onRemoveDeviceFromSeries?: (device: RepairDevice) => void;
  onCreateSeries?: () => void;
  onEditSeries?: (series: RepairDeviceSeries) => void;
  onDeleteSeries?: (series: RepairDeviceSeries) => void;
  onAssignDevices?: (series: RepairDeviceSeries) => void;
}

export function RepairsSeriesDevicesStep({
  series,
  seriesLoading = false,
  devicesLoading = false,
  devices,
  manufacturerName,
  categoryId,
  selectedDeviceId,
  onSelectDevice,
  onAddDevice,
  onEditDevice,
  onDeleteDevice,
  onRemoveDeviceFromSeries,
  onCreateSeries,
  onEditSeries,
  onDeleteSeries,
  onAssignDevices,
}: RepairsSeriesDevicesStepProps) {
  const [activeSeriesId, setActiveSeriesId] = useState<string | null>(null);

  const activeSeries = useMemo(
    () => series.find((s) => s.id === activeSeriesId) ?? null,
    [series, activeSeriesId],
  );

  const devicesBySeriesDbId = useMemo(() => {
    const map = new Map<number, RepairDevice[]>();
    for (const device of devices) {
      if (device.isAdd || device.dbId == null) continue;
      const seriesId = device.repairDeviceSeriesId;
      if (seriesId == null) continue;
      const list = map.get(seriesId) ?? [];
      list.push(device);
      map.set(seriesId, list);
    }
    return map;
  }, [devices]);

  const unassignedDevices = useMemo(
    () =>
      devices.filter(
        (d) => !d.isAdd && d.dbId != null && d.repairDeviceSeriesId == null,
      ),
    [devices],
  );

  if (seriesLoading || devicesLoading) {
    return (
      <div className="flex min-h-[200px] flex-1 items-center justify-center text-sm text-[#6B7280]">
        {seriesLoading ? "Loading series…" : "Loading devices…"}
      </div>
    );
  }

  if (activeSeries) {
    const seriesDevices = activeSeries.dbId
      ? (devicesBySeriesDbId.get(activeSeries.dbId) ?? [])
      : [];

    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="mb-4 flex shrink-0 flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 gap-1.5"
            onClick={() => setActiveSeriesId(null)}
          >
            <ArrowLeft className="size-4" />
            All series
          </Button>
          <span className="text-sm font-medium text-[#111827]">
            {manufacturerName} · {activeSeries.name}
          </span>
          <div className="ml-auto flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9"
              onClick={() => onAssignDevices?.(activeSeries)}
            >
              Add existing models
            </Button>
            <Button
              type="button"
              size="sm"
              className="h-9 gap-1"
              onClick={() => onAddDevice?.(activeSeries.dbId)}
            >
              <Plus className="size-4" />
              New model
            </Button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
          {seriesDevices.length === 0 ? (
            <div className="flex min-h-[160px] flex-col items-center justify-center rounded-xl border border-dashed border-[#E5E7EB] bg-[#F9FAFB] p-6 text-center">
              <p className="text-sm font-medium text-[#374151]">No models in this series</p>
              <p className="mt-1 text-xs text-[#6B7280]">
                Add existing models or create a new one.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5">
              {seriesDevices.map((device) => (
                <SeriesDeviceCard
                  key={String(device.dbId ?? device.id)}
                  device={device}
                  categoryId={categoryId}
                  selected={selectedDeviceId === device.id}
                  onSelect={() => onSelectDevice(device.id)}
                  onEdit={onEditDevice}
                  onDelete={onDeleteDevice}
                  onRemoveFromSeries={onRemoveDeviceFromSeries}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-4 flex shrink-0 items-center justify-between gap-2">
        <p className="text-sm text-[#6B7280]">
          {manufacturerName} — select a series to view models
        </p>
        {onCreateSeries ? (
          <Button type="button" size="sm" className="h-9 gap-1" onClick={onCreateSeries}>
            <Plus className="size-4" />
            Create series
          </Button>
        ) : null}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
        {series.length === 0 ? (
          <div className="flex min-h-[160px] flex-col items-center justify-center rounded-xl border border-dashed border-[#E5E7EB] bg-[#F9FAFB] p-6 text-center">
            <p className="text-sm font-medium text-[#374151]">No series yet</p>
            <p className="mt-1 text-xs text-[#6B7280]">
              Use the menu on a manufacturer or Create series to add one.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5">
            {series.map((item) => {
              const count = item.dbId
                ? (devicesBySeriesDbId.get(item.dbId)?.length ?? 0)
                : 0;
              return (
                <SeriesCard
                  key={item.dbId ?? item.id}
                  series={item}
                  modelCount={count}
                  onOpen={() => setActiveSeriesId(item.id)}
                  onEdit={onEditSeries}
                  onDelete={onDeleteSeries}
                />
              );
            })}
          </div>
        )}

        {unassignedDevices.length > 0 ? (
          <div className="mt-8">
            <h3 className="mb-3 text-sm font-semibold text-[#374151]">
              Unassigned models ({unassignedDevices.length})
            </h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5">
              {unassignedDevices.map((device) => (
                <SeriesDeviceCard
                  key={String(device.dbId ?? device.id)}
                  device={device}
                  categoryId={categoryId}
                  selected={selectedDeviceId === device.id}
                  onSelect={() => onSelectDevice(device.id)}
                  onEdit={onEditDevice}
                  onDelete={onDeleteDevice}
                />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function SeriesCard({
  series,
  modelCount,
  onOpen,
  onEdit,
  onDelete,
}: {
  series: RepairDeviceSeries;
  modelCount: number;
  onOpen: () => void;
  onEdit?: (series: RepairDeviceSeries) => void;
  onDelete?: (series: RepairDeviceSeries) => void;
}) {
  const canManage = series.dbId != null;

  return (
    <div className="relative">
      {canManage && (onEdit || onDelete) ? (
        <DropdownMenu>
          <DropdownMenuTrigger
            type="button"
            className="absolute top-2 right-2 z-10 flex size-7 items-center justify-center rounded-md bg-white/90 text-[#6B7280] shadow-sm ring-1 ring-[#E5E7EB] hover:text-[#111827] data-popup-open:bg-white"
            onClick={(e) => e.stopPropagation()}
            aria-label={`Actions for ${series.name}`}
          >
            <MoreHorizontal className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            {onEdit ? (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(series);
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
                  onDelete(series);
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
        onClick={onOpen}
        className="flex min-h-[108px] w-full flex-col items-center justify-center gap-2 rounded-lg border border-[#E5E7EB] bg-white p-3 shadow-sm transition-all hover:border-[var(--repair-primary)] hover:shadow-md"
      >
        <div className="flex size-11 items-center justify-center rounded-full bg-[#F3F4F6] text-[#374151]">
          <Layers className="size-6" strokeWidth={1.5} />
        </div>
        <span className="text-center text-xs font-medium text-[#111827]">
          {series.name}
        </span>
        <span className="text-[10px] text-[#6B7280]">
          {modelCount} {modelCount === 1 ? "model" : "models"}
        </span>
      </button>
    </div>
  );
}

function SeriesDeviceCard({
  device,
  categoryId,
  selected,
  onSelect,
  onEdit,
  onDelete,
  onRemoveFromSeries,
}: {
  device: RepairDevice;
  categoryId?: string | null;
  selected: boolean;
  onSelect: () => void;
  onEdit?: (device: RepairDevice) => void;
  onDelete?: (device: RepairDevice) => void;
  onRemoveFromSeries?: (device: RepairDevice) => void;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const canManage = device.dbId != null;
  const showCustomImage = Boolean(device.imageUrl) && !imageFailed;

  return (
    <div className="relative">
      {canManage && (onEdit || onDelete || onRemoveFromSeries) ? (
        <DropdownMenu>
          <DropdownMenuTrigger
            type="button"
            className="absolute top-2 right-2 z-10 flex size-7 items-center justify-center rounded-md bg-white/90 text-[#6B7280] shadow-sm ring-1 ring-[#E5E7EB] hover:text-[#111827] data-popup-open:bg-white"
            onClick={(e) => e.stopPropagation()}
            aria-label={`Actions for ${device.name}`}
          >
            <MoreHorizontal className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {onRemoveFromSeries ? (
              <>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveFromSeries(device);
                  }}
                >
                  <UserMinus className="size-4" />
                  Remove from series
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            ) : null}
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
                Delete model
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
