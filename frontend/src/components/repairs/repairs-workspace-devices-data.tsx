"use client";

import { useEffect, useRef } from "react";
import {
  useCreateRepairDevice,
  useDeleteRepairDevice,
  useRepairDevices,
  useUpdateRepairDevice,
} from "@/hooks/use-repair-devices";
import {
  useCreateRepairDeviceSeries,
  useDeleteRepairDeviceSeries,
  useRepairDeviceSeries,
  useUpdateRepairDeviceSeries,
} from "@/hooks/use-repair-device-series";
import type { RepairDevice } from "@/lib/repairs-pos-data";
import type { RepairDeviceSeries } from "@/lib/repairs-series-data";

const EMPTY_DEVICES: RepairDevice[] = [];
const EMPTY_DEVICE_SERIES: RepairDeviceSeries[] = [];

export interface RepairsWorkspaceDevicesDataSnapshot {
  devices: RepairDevice[];
  devicesLoading: boolean;
  devicesError: boolean;
  deviceSeries: RepairDeviceSeries[];
  deviceSeriesLoading: boolean;
  createDevice: ReturnType<typeof useCreateRepairDevice>;
  updateDevice: ReturnType<typeof useUpdateRepairDevice>;
  deleteDevice: ReturnType<typeof useDeleteRepairDevice>;
  createDeviceSeries: ReturnType<typeof useCreateRepairDeviceSeries>;
  updateDeviceSeries: ReturnType<typeof useUpdateRepairDeviceSeries>;
  deleteDeviceSeries: ReturnType<typeof useDeleteRepairDeviceSeries>;
}

interface RepairsWorkspaceDevicesDataProps {
  shopId: number;
  selectedCategoryDbId: number;
  selectedManufacturerDbId: number;
  seriesFormManufacturerDbId: number;
  onSnapshot: (snapshot: RepairsWorkspaceDevicesDataSnapshot) => void;
}

export function RepairsWorkspaceDevicesData({
  shopId,
  selectedCategoryDbId,
  selectedManufacturerDbId,
  seriesFormManufacturerDbId,
  onSnapshot,
}: RepairsWorkspaceDevicesDataProps) {
  const {
    data: devices = EMPTY_DEVICES,
    isLoading: devicesLoading,
    isError: devicesError,
  } = useRepairDevices(shopId, selectedCategoryDbId, selectedManufacturerDbId);

  const createDevice = useCreateRepairDevice(
    shopId,
    selectedCategoryDbId,
    selectedManufacturerDbId,
  );
  const updateDevice = useUpdateRepairDevice(
    shopId,
    selectedCategoryDbId,
    selectedManufacturerDbId,
  );
  const deleteDevice = useDeleteRepairDevice(
    shopId,
    selectedCategoryDbId,
    selectedManufacturerDbId,
  );

  const { data: deviceSeries = EMPTY_DEVICE_SERIES, isLoading: deviceSeriesLoading } =
    useRepairDeviceSeries(shopId, selectedCategoryDbId, selectedManufacturerDbId);

  const createDeviceSeries = useCreateRepairDeviceSeries(
    shopId,
    selectedCategoryDbId,
    seriesFormManufacturerDbId,
  );
  const updateDeviceSeries = useUpdateRepairDeviceSeries(
    shopId,
    selectedCategoryDbId,
    selectedManufacturerDbId,
  );
  const deleteDeviceSeries = useDeleteRepairDeviceSeries(
    shopId,
    selectedCategoryDbId,
    selectedManufacturerDbId,
  );

  const onSnapshotRef = useRef(onSnapshot);
  onSnapshotRef.current = onSnapshot;

  const mutationPending =
    createDevice.isPending ||
    updateDevice.isPending ||
    deleteDevice.isPending ||
    createDeviceSeries.isPending ||
    updateDeviceSeries.isPending ||
    deleteDeviceSeries.isPending;

  const lastEmitRef = useRef<{
    devices: RepairDevice[];
    devicesLoading: boolean;
    devicesError: boolean;
    deviceSeries: RepairDeviceSeries[];
    deviceSeriesLoading: boolean;
    mutationPending: boolean;
  } | null>(null);

  useEffect(() => {
    const prev = lastEmitRef.current;
    if (
      prev &&
      prev.devices === devices &&
      prev.devicesLoading === devicesLoading &&
      prev.devicesError === devicesError &&
      prev.deviceSeries === deviceSeries &&
      prev.deviceSeriesLoading === deviceSeriesLoading &&
      prev.mutationPending === mutationPending
    ) {
      return;
    }
    lastEmitRef.current = {
      devices,
      devicesLoading,
      devicesError,
      deviceSeries,
      deviceSeriesLoading,
      mutationPending,
    };
    onSnapshotRef.current({
      devices,
      devicesLoading,
      devicesError,
      deviceSeries,
      deviceSeriesLoading,
      createDevice,
      updateDevice,
      deleteDevice,
      createDeviceSeries,
      updateDeviceSeries,
      deleteDeviceSeries,
    });
  }, [
    devices,
    devicesLoading,
    devicesError,
    deviceSeries,
    deviceSeriesLoading,
    mutationPending,
  ]);

  return null;
}
