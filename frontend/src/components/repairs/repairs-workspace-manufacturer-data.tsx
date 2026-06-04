"use client";

import { useEffect, useRef } from "react";
import {
  useCreateRepairManufacturer,
  useDeleteRepairManufacturer,
  useRepairManufacturers,
  useUpdateRepairManufacturer,
} from "@/hooks/use-repair-manufacturers";
import type { RepairManufacturer } from "@/lib/repairs-pos-data";

const EMPTY_MANUFACTURERS: RepairManufacturer[] = [];

export interface RepairsWorkspaceManufacturerDataSnapshot {
  manufacturers: RepairManufacturer[];
  manufacturersLoading: boolean;
  manufacturersError: boolean;
  manufacturersQueryError: unknown;
  createManufacturer: ReturnType<typeof useCreateRepairManufacturer>;
  updateManufacturer: ReturnType<typeof useUpdateRepairManufacturer>;
  deleteManufacturer: ReturnType<typeof useDeleteRepairManufacturer>;
}

interface RepairsWorkspaceManufacturerDataProps {
  shopId: number;
  selectedCategoryDbId: number;
  onSnapshot: (snapshot: RepairsWorkspaceManufacturerDataSnapshot) => void;
}

export function RepairsWorkspaceManufacturerData({
  shopId,
  selectedCategoryDbId,
  onSnapshot,
}: RepairsWorkspaceManufacturerDataProps) {
  const {
    data: manufacturers = EMPTY_MANUFACTURERS,
    isLoading: manufacturersLoading,
    isError: manufacturersError,
    error: manufacturersQueryError,
    isFetching: manufacturersFetching,
  } = useRepairManufacturers(shopId, selectedCategoryDbId);

  const createManufacturer = useCreateRepairManufacturer(
    shopId,
    selectedCategoryDbId,
  );
  const updateManufacturer = useUpdateRepairManufacturer(
    shopId,
    selectedCategoryDbId,
  );
  const deleteManufacturer = useDeleteRepairManufacturer(
    shopId,
    selectedCategoryDbId,
  );

  const onSnapshotRef = useRef(onSnapshot);
  onSnapshotRef.current = onSnapshot;

  const mutationPending =
    createManufacturer.isPending ||
    updateManufacturer.isPending ||
    deleteManufacturer.isPending;

  const manufacturersLoadingOrFetching =
    manufacturersLoading || (manufacturersFetching && manufacturers.length === 0);

  const lastEmitRef = useRef<{
    manufacturers: RepairManufacturer[];
    manufacturersLoading: boolean;
    manufacturersError: boolean;
    manufacturersQueryError: unknown;
    mutationPending: boolean;
  } | null>(null);

  useEffect(() => {
    const prev = lastEmitRef.current;
    if (
      prev &&
      prev.manufacturers === manufacturers &&
      prev.manufacturersLoading === manufacturersLoadingOrFetching &&
      prev.manufacturersError === manufacturersError &&
      prev.manufacturersQueryError === manufacturersQueryError &&
      prev.mutationPending === mutationPending
    ) {
      return;
    }
    lastEmitRef.current = {
      manufacturers,
      manufacturersLoading: manufacturersLoadingOrFetching,
      manufacturersError,
      manufacturersQueryError,
      mutationPending,
    };
    onSnapshotRef.current({
      manufacturers,
      manufacturersLoading: manufacturersLoadingOrFetching,
      manufacturersError,
      manufacturersQueryError,
      createManufacturer,
      updateManufacturer,
      deleteManufacturer,
    });
  }, [
    manufacturers,
    manufacturersLoadingOrFetching,
    manufacturersError,
    manufacturersQueryError,
    mutationPending,
  ]);

  return null;
}
