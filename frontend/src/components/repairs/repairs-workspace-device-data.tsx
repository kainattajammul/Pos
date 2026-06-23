"use client";

import { useEffect, useRef } from "react";
import {
  useCreateRepairDeviceIssue,
  useDeleteRepairDeviceIssue,
  useRepairDeviceIssues,
  useUpdateRepairDeviceIssue,
} from "@/hooks/use-repair-device-issues";
import {
  useCreateRepairDevicePart,
  useDeleteRepairDevicePart,
  useRepairDeviceParts,
  useUpdateRepairDevicePart,
} from "@/hooks/use-repair-device-parts";
import type { RepairProblem } from "@/lib/repairs-problems-data";
import { REPAIR_PROBLEMS_FALLBACK } from "@/lib/repairs-problems-data";
import type { RepairPart } from "@/lib/repairs-parts-data";
import { REPAIR_PARTS_FALLBACK } from "@/lib/repairs-parts-data";

export interface RepairsWorkspaceDeviceDataSnapshot {
  problems: RepairProblem[];
  parts: RepairPart[];
  problemsLoading: boolean;
  partsLoading: boolean;
  problemsError: boolean;
  partsError: boolean;
  problemsQueryError: unknown;
  partsQueryError: unknown;
  createIssue: ReturnType<typeof useCreateRepairDeviceIssue>;
  updateIssue: ReturnType<typeof useUpdateRepairDeviceIssue>;
  deleteIssue: ReturnType<typeof useDeleteRepairDeviceIssue>;
  createPart: ReturnType<typeof useCreateRepairDevicePart>;
  updatePart: ReturnType<typeof useUpdateRepairDevicePart>;
  deletePart: ReturnType<typeof useDeleteRepairDevicePart>;
}

interface RepairsWorkspaceDeviceDataProps {
  shopId: number;
  selectedCategoryDbId: number;
  selectedManufacturerDbId: number;
  selectedDeviceDbId: number;
  onSnapshot: (snapshot: RepairsWorkspaceDeviceDataSnapshot) => void;
}

/** Issue/part queries and mutations — separate chunk from catalog workflow. */
export function RepairsWorkspaceDeviceData({
  shopId,
  selectedCategoryDbId,
  selectedManufacturerDbId,
  selectedDeviceDbId,
  onSnapshot,
}: RepairsWorkspaceDeviceDataProps) {
  const {
    data: problems = REPAIR_PROBLEMS_FALLBACK,
    isLoading: problemsLoading,
    isError: problemsError,
    error: problemsQueryError,
  } = useRepairDeviceIssues(
    shopId,
    selectedCategoryDbId,
    selectedManufacturerDbId,
    selectedDeviceDbId,
  );

  const createIssue = useCreateRepairDeviceIssue(
    shopId,
    selectedCategoryDbId,
    selectedManufacturerDbId,
    selectedDeviceDbId,
  );
  const updateIssue = useUpdateRepairDeviceIssue(
    shopId,
    selectedCategoryDbId,
    selectedManufacturerDbId,
    selectedDeviceDbId,
  );
  const deleteIssue = useDeleteRepairDeviceIssue(
    shopId,
    selectedCategoryDbId,
    selectedManufacturerDbId,
    selectedDeviceDbId,
  );

  const {
    data: parts = REPAIR_PARTS_FALLBACK,
    isLoading: partsLoading,
    isError: partsError,
    error: partsQueryError,
  } = useRepairDeviceParts(
    shopId,
    selectedCategoryDbId,
    selectedManufacturerDbId,
    selectedDeviceDbId,
  );

  const createPart = useCreateRepairDevicePart(
    shopId,
    selectedCategoryDbId,
    selectedManufacturerDbId,
    selectedDeviceDbId,
  );
  const updatePart = useUpdateRepairDevicePart(
    shopId,
    selectedCategoryDbId,
    selectedManufacturerDbId,
    selectedDeviceDbId,
  );
  const deletePart = useDeleteRepairDevicePart(
    shopId,
    selectedCategoryDbId,
    selectedManufacturerDbId,
    selectedDeviceDbId,
  );

  const onSnapshotRef = useRef(onSnapshot);
  onSnapshotRef.current = onSnapshot;

  const issueMutationPending =
    createIssue.isPending ||
    updateIssue.isPending ||
    deleteIssue.isPending;
  const partMutationPending =
    createPart.isPending ||
    updatePart.isPending ||
    deletePart.isPending;

  const lastEmitRef = useRef<{
    problems: RepairProblem[];
    parts: RepairPart[];
    problemsLoading: boolean;
    partsLoading: boolean;
    problemsError: boolean;
    partsError: boolean;
    problemsQueryError: unknown;
    partsQueryError: unknown;
    issueMutationPending: boolean;
    partMutationPending: boolean;
  } | null>(null);

  useEffect(() => {
    const prev = lastEmitRef.current;
    if (
      prev &&
      prev.problems === problems &&
      prev.parts === parts &&
      prev.problemsLoading === problemsLoading &&
      prev.partsLoading === partsLoading &&
      prev.problemsError === partsError &&
      prev.problemsQueryError === problemsQueryError &&
      prev.partsQueryError === partsQueryError &&
      prev.issueMutationPending === issueMutationPending &&
      prev.partMutationPending === partMutationPending
    ) {
      return;
    }
    lastEmitRef.current = {
      problems,
      parts,
      problemsLoading,
      partsLoading,
      problemsError,
      partsError,
      problemsQueryError,
      partsQueryError,
      issueMutationPending,
      partMutationPending,
    };
    onSnapshotRef.current({
      problems,
      parts,
      problemsLoading,
      partsLoading,
      problemsError,
      partsError,
      problemsQueryError,
      partsQueryError,
      createIssue,
      updateIssue,
      deleteIssue,
      createPart,
      updatePart,
      deletePart,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    problems,
    parts,
    problemsLoading,
    partsLoading,
    problemsError,
    partsError,
    problemsQueryError,
    partsQueryError,
    issueMutationPending,
    partMutationPending,
  ]);

  return null;
}
