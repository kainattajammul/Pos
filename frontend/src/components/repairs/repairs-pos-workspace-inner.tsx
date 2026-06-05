"use client";

import { useEffect, useMemo, useRef, useState, type ComponentProps } from "react";
import { useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/axios";
import { queryKeys } from "@/constants/query-keys";
import { fetchRepairBookingContext } from "@/services/repair-search.service";
import { APP_CONFIG } from "@/constants/config";
import { formatCurrency } from "@/utils/format";
import type { RepairsWorkspaceCategoryDataSnapshot } from "@/components/repairs/repairs-workspace-category-data";
import type { RepairsWorkspaceManufacturerDataSnapshot } from "@/components/repairs/repairs-workspace-manufacturer-data";
import type { RepairsWorkspaceDevicesDataSnapshot } from "@/components/repairs/repairs-workspace-devices-data";
import type { RepairsWorkspaceDeviceDataSnapshot } from "@/components/repairs/repairs-workspace-device-data";

const RepairsWorkspaceCategoryData = dynamic(
  () =>
    import("@/components/repairs/repairs-workspace-category-data").then(
      (m) => m.RepairsWorkspaceCategoryData,
    ),
  { ssr: false },
);
const RepairsWorkspaceManufacturerData = dynamic(
  () =>
    import("@/components/repairs/repairs-workspace-manufacturer-data").then(
      (m) => m.RepairsWorkspaceManufacturerData,
    ),
  { ssr: false },
);
const RepairsWorkspaceDevicesData = dynamic(
  () =>
    import("@/components/repairs/repairs-workspace-devices-data").then(
      (m) => m.RepairsWorkspaceDevicesData,
    ),
  { ssr: false },
);
const RepairsWorkspaceDeviceData = dynamic(
  () =>
    import("@/components/repairs/repairs-workspace-device-data").then(
      (m) => m.RepairsWorkspaceDeviceData,
    ),
  { ssr: false },
);
import type {
  RepairCategoryCard,
  RepairDevice,
  RepairManufacturer,
  RepairStep,
} from "@/lib/repairs-pos-data";
import type { RepairProblem } from "@/lib/repairs-problems-data";
import { REPAIR_PROBLEMS_FALLBACK } from "@/lib/repairs-problems-data";
import type { RepairPart } from "@/lib/repairs-parts-data";
import type { RepairDeviceSeries } from "@/lib/repairs-series-data";
import { REPAIR_PARTS_FALLBACK } from "@/lib/repairs-parts-data";
import { getDefaultRepairCharges } from "@/lib/repairs-details-data";
import {
  canNavigateToRepairStep,
  getNextRepairStep,
  getRepairStepIndex,
  isAddDeviceInList,
} from "@/lib/repairs-pos-data";
import { REPAIR_DEVICES_FALLBACK } from "@/lib/repairs-devices-data";
import {
  getManufacturerSeriesModeKey,
  readSeriesModeByManufacturer,
  writeSeriesModeByManufacturer,
  type SeriesModeByManufacturer,
} from "@/lib/repairs-series-mode";
import type { RepairSearchSelection } from "@/types/repair-search";

const DeleteUserDialog = dynamic(
  () =>
    import("@/components/users/delete-user-dialog").then((m) => m.DeleteUserDialog),
  { ssr: false },
);

const RepairsWorkflowPanel = dynamic(
  () =>
    import("@/components/repairs/repairs-workflow-panel").then(
      (m) => m.RepairsWorkflowPanel,
    ),
  { ssr: false },
);
const LOADING_CATEGORIES: RepairCategoryCard[] = [];
const LOADING_MANUFACTURERS: RepairManufacturer[] = [
  { id: "add", name: "Add Manufacturer", isAdd: true },
];
import { useRepairTicket } from "@/contexts/repair-ticket-context";
import type { RepairWorkspaceProviderProps } from "@/components/repairs/repairs-pos-provider-types";

const RepairCategoryFormDialog = dynamic(
  () =>
    import("@/components/repairs/repair-category-form-dialog").then(
      (m) => m.RepairCategoryFormDialog,
    ),
  { ssr: false },
);
const RepairManufacturerFormDialog = dynamic(
  () =>
    import("@/components/repairs/repair-manufacturer-form-dialog").then(
      (m) => m.RepairManufacturerFormDialog,
    ),
  { ssr: false },
);
const RepairDeviceFormDialog = dynamic(
  () =>
    import("@/components/repairs/repair-device-form-dialog").then(
      (m) => m.RepairDeviceFormDialog,
    ),
  { ssr: false },
);
const RepairDeviceIssueFormDialog = dynamic(
  () =>
    import("@/components/repairs/repair-device-issue-form-dialog").then(
      (m) => m.RepairDeviceIssueFormDialog,
    ),
  { ssr: false },
);
const RepairDevicePartFormDialog = dynamic(
  () =>
    import("@/components/repairs/repair-device-part-form-dialog").then(
      (m) => m.RepairDevicePartFormDialog,
    ),
  { ssr: false },
);
const RepairDeviceSeriesFormDialog = dynamic(
  () =>
    import("@/components/repairs/repair-device-series-form-dialog").then(
      (m) => m.RepairDeviceSeriesFormDialog,
    ),
  { ssr: false },
);
const RepairsAssignDevicesDialog = dynamic(
  () =>
    import("@/components/repairs/repairs-assign-devices-dialog").then(
      (m) => m.RepairsAssignDevicesDialog,
    ),
  { ssr: false },
);

type DeleteTarget =
  | { type: "category"; item: RepairCategoryCard }
  | { type: "manufacturer"; item: RepairManufacturer }
  | { type: "series"; item: RepairDeviceSeries }
  | { type: "device"; item: RepairDevice }
  | { type: "issue"; item: RepairProblem }
  | { type: "part"; item: RepairPart };

export interface RepairsPosWorkspaceCoreProps {
  onProviderPropsChange: (props: RepairWorkspaceProviderProps) => void;
}

function RepairsPosWorkspaceCoreInner({
  onProviderPropsChange,
}: RepairsPosWorkspaceCoreProps) {
  const shopId = APP_CONFIG.defaultShopId;
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const [categorySnap, setCategorySnap] =
    useState<RepairsWorkspaceCategoryDataSnapshot | null>(null);
  const [manufacturerSnap, setManufacturerSnap] =
    useState<RepairsWorkspaceManufacturerDataSnapshot | null>(null);
  const [devicesSnap, setDevicesSnap] = useState<RepairsWorkspaceDevicesDataSnapshot | null>(
    null,
  );

  const handleCategorySnapshot = (snapshot: RepairsWorkspaceCategoryDataSnapshot) => {
    setCategorySnap((prev) => {
      if (
        prev &&
        prev.categories === snapshot.categories &&
        prev.categoriesLoading === snapshot.categoriesLoading &&
        prev.categoriesError === snapshot.categoriesError &&
        prev.createCategory.isPending === snapshot.createCategory.isPending &&
        prev.updateCategory.isPending === snapshot.updateCategory.isPending &&
        prev.deleteCategory.isPending === snapshot.deleteCategory.isPending
      ) {
        return prev;
      }
      return snapshot;
    });
  };

  const handleManufacturerSnapshot = (
    snapshot: RepairsWorkspaceManufacturerDataSnapshot,
  ) => {
    setManufacturerSnap((prev) => {
      if (
        prev &&
        prev.manufacturers === snapshot.manufacturers &&
        prev.manufacturersLoading === snapshot.manufacturersLoading &&
        prev.manufacturersError === snapshot.manufacturersError &&
        prev.manufacturersQueryError === snapshot.manufacturersQueryError &&
        prev.createManufacturer.isPending === snapshot.createManufacturer.isPending &&
        prev.updateManufacturer.isPending === snapshot.updateManufacturer.isPending &&
        prev.deleteManufacturer.isPending === snapshot.deleteManufacturer.isPending
      ) {
        return prev;
      }
      return snapshot;
    });
  };

  const handleDevicesSnapshot = (snapshot: RepairsWorkspaceDevicesDataSnapshot) => {
    setDevicesSnap((prev) => {
      if (
        prev &&
        prev.devices === snapshot.devices &&
        prev.devicesLoading === snapshot.devicesLoading &&
        prev.devicesError === snapshot.devicesError &&
        prev.deviceSeries === snapshot.deviceSeries &&
        prev.deviceSeriesLoading === snapshot.deviceSeriesLoading &&
        prev.createDevice.isPending === snapshot.createDevice.isPending &&
        prev.updateDevice.isPending === snapshot.updateDevice.isPending &&
        prev.deleteDevice.isPending === snapshot.deleteDevice.isPending &&
        prev.createDeviceSeries.isPending === snapshot.createDeviceSeries.isPending &&
        prev.updateDeviceSeries.isPending === snapshot.updateDeviceSeries.isPending &&
        prev.deleteDeviceSeries.isPending === snapshot.deleteDeviceSeries.isPending
      ) {
        return prev;
      }
      return snapshot;
    });
  };

  const categories = categorySnap?.categories ?? LOADING_CATEGORIES;
  const categoriesLoading = categorySnap?.categoriesLoading ?? true;
  const categoriesError = categorySnap?.categoriesError ?? false;
  const createCategory = categorySnap?.createCategory;
  const updateCategory = categorySnap?.updateCategory;
  const deleteCategory = categorySnap?.deleteCategory;

  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<RepairCategoryCard | null>(
    null,
  );
  const [manufacturerDialogOpen, setManufacturerDialogOpen] = useState(false);
  const [editingManufacturer, setEditingManufacturer] =
    useState<RepairManufacturer | null>(null);
  const [deviceDialogOpen, setDeviceDialogOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<RepairDevice | null>(null);
  const [issueDialogOpen, setIssueDialogOpen] = useState(false);
  const [editingIssue, setEditingIssue] = useState<RepairProblem | null>(null);
  const [partDialogOpen, setPartDialogOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<RepairPart | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [seriesModeByManufacturer, setSeriesModeByManufacturer] = useState<
    SeriesModeByManufacturer
  >(readSeriesModeByManufacturer);
  const [seriesDialogOpen, setSeriesDialogOpen] = useState(false);
  const [editingSeries, setEditingSeries] = useState<RepairDeviceSeries | null>(null);
  const [seriesFormManufacturer, setSeriesFormManufacturer] =
    useState<RepairManufacturer | null>(null);
  const [assignSeriesTarget, setAssignSeriesTarget] =
    useState<RepairDeviceSeries | null>(null);
  const [pendingDeviceSeriesId, setPendingDeviceSeriesId] = useState<number | null>(
    null,
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState<RepairStep>("Category");
  const [furthestStep, setFurthestStep] = useState<RepairStep>("Category");
  const [selectedManufacturerId, setSelectedManufacturerId] = useState<string | null>(
    null,
  );
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [selectedProblemIds, setSelectedProblemIds] = useState<string[]>([]);
  const [selectedPartIds, setSelectedPartIds] = useState<string[]>([]);
  const deepLinkKeyRef = useRef<string | null>(null);
  const [loadCatalogData, setLoadCatalogData] = useState(false);

  useEffect(() => {
    const enable = () => setLoadCatalogData(true);
    if (typeof requestIdleCallback !== "undefined") {
      const id = requestIdleCallback(enable, { timeout: 300 });
      return () => cancelIdleCallback(id);
    }
    const t = window.setTimeout(enable, 0);
    return () => window.clearTimeout(t);
  }, []);

  const selectedCategoryDbId = useMemo(() => {
    const match = categories.find((c) => c.id === selectedCategoryId && !c.isAdd);
    return match?.dbId ?? null;
  }, [categories, selectedCategoryId]);

  const manufacturers = manufacturerSnap?.manufacturers ?? LOADING_MANUFACTURERS;
  const manufacturersLoading = manufacturerSnap?.manufacturersLoading ?? false;
  const manufacturersError = manufacturerSnap?.manufacturersError ?? false;
  const manufacturersQueryError = manufacturerSnap?.manufacturersQueryError;
  const createManufacturer = manufacturerSnap?.createManufacturer;
  const updateManufacturer = manufacturerSnap?.updateManufacturer;
  const deleteManufacturer = manufacturerSnap?.deleteManufacturer;

  const loadManufacturerData =
    selectedCategoryDbId != null && selectedCategoryDbId > 0;

  useEffect(() => {
    if (!loadManufacturerData) {
      setManufacturerSnap(null);
    }
  }, [loadManufacturerData]);

  const selectedManufacturerDbId = useMemo(() => {
    const match = manufacturers.find(
      (m) => m.id === selectedManufacturerId && !m.isAdd,
    );
    return match?.dbId ?? null;
  }, [manufacturers, selectedManufacturerId]);

  const devices = devicesSnap?.devices ?? REPAIR_DEVICES_FALLBACK;
  const devicesLoading = devicesSnap?.devicesLoading ?? false;
  const devicesError = devicesSnap?.devicesError ?? false;
  const deviceSeries = devicesSnap?.deviceSeries ?? [];
  const deviceSeriesLoading = devicesSnap?.deviceSeriesLoading ?? false;
  const createDevice = devicesSnap?.createDevice;
  const updateDevice = devicesSnap?.updateDevice;
  const deleteDevice = devicesSnap?.deleteDevice;
  const createDeviceSeries = devicesSnap?.createDeviceSeries;
  const updateDeviceSeries = devicesSnap?.updateDeviceSeries;
  const deleteDeviceSeries = devicesSnap?.deleteDeviceSeries;

  const seriesFormManufacturerDbId =
    seriesFormManufacturer?.dbId ?? selectedManufacturerDbId;

  const loadDevicesData =
    loadManufacturerData &&
    selectedManufacturerDbId != null &&
    selectedManufacturerDbId > 0;

  useEffect(() => {
    if (!loadDevicesData) {
      setDevicesSnap(null);
    }
  }, [loadDevicesData]);

  const selectedDeviceDbId = useMemo(() => {
    const match = devices.find((d) => d.id === selectedDeviceId && !d.isAdd);
    return match?.dbId ?? null;
  }, [devices, selectedDeviceId]);

  const [deviceData, setDeviceData] = useState<RepairsWorkspaceDeviceDataSnapshot | null>(
    null,
  );

  const handleDeviceDataSnapshot = (snapshot: RepairsWorkspaceDeviceDataSnapshot) => {
    setDeviceData((prev) => {
      if (
        prev &&
        prev.problems === snapshot.problems &&
        prev.parts === snapshot.parts &&
        prev.problemsLoading === snapshot.problemsLoading &&
        prev.partsLoading === snapshot.partsLoading &&
        prev.problemsError === snapshot.problemsError &&
        prev.partsError === snapshot.partsError &&
        prev.problemsQueryError === snapshot.problemsQueryError &&
        prev.partsQueryError === snapshot.partsQueryError &&
        prev.createIssue.isPending === snapshot.createIssue.isPending &&
        prev.updateIssue.isPending === snapshot.updateIssue.isPending &&
        prev.deleteIssue.isPending === snapshot.deleteIssue.isPending &&
        prev.createPart.isPending === snapshot.createPart.isPending &&
        prev.updatePart.isPending === snapshot.updatePart.isPending &&
        prev.deletePart.isPending === snapshot.deletePart.isPending
      ) {
        return prev;
      }
      return snapshot;
    });
  };

  const loadDeviceData =
    selectedCategoryDbId != null &&
    selectedCategoryDbId > 0 &&
    selectedManufacturerDbId != null &&
    selectedManufacturerDbId > 0 &&
    selectedDeviceDbId != null &&
    selectedDeviceDbId > 0;

  useEffect(() => {
    if (!loadDeviceData) {
      setDeviceData(null);
    }
  }, [loadDeviceData]);

  const problems = deviceData?.problems ?? REPAIR_PROBLEMS_FALLBACK;
  const parts = deviceData?.parts ?? REPAIR_PARTS_FALLBACK;
  const problemsLoading = deviceData?.problemsLoading ?? false;
  const partsLoading = deviceData?.partsLoading ?? false;
  const problemsError = deviceData?.problemsError ?? false;
  const partsError = deviceData?.partsError ?? false;
  const problemsQueryError = deviceData?.problemsQueryError;
  const partsQueryError = deviceData?.partsQueryError;
  const createIssue = deviceData?.createIssue;
  const updateIssue = deviceData?.updateIssue;
  const deleteIssue = deviceData?.deleteIssue;
  const createPart = deviceData?.createPart;
  const updatePart = deviceData?.updatePart;
  const deletePart = deviceData?.deletePart;

  const initialRepairCharges = useMemo(
    () =>
      getDefaultRepairCharges(selectedProblemIds, selectedPartIds, problems, parts),
    [selectedProblemIds, selectedPartIds, problems, parts],
  );

  const openAddCategory = () => {
    setEditingCategory(null);
    setCategoryDialogOpen(true);
  };

  const openEditCategory = (category: RepairCategoryCard) => {
    setEditingCategory(category);
    setCategoryDialogOpen(true);
  };

  const handleDeleteCategory = (category: RepairCategoryCard) => {
    if (!category.dbId) return;
    setDeleteTarget({ type: "category", item: category });
  };

  const handleDeleteManufacturer = (manufacturer: RepairManufacturer) => {
    if (!manufacturer.dbId) return;
    setDeleteTarget({ type: "manufacturer", item: manufacturer });
  };

  const handleSeriesModeChange = (
    manufacturer: RepairManufacturer,
    enabled: boolean,
  ) => {
    const key = getManufacturerSeriesModeKey(manufacturer);
    setSeriesModeByManufacturer((prev) => {
      const next = { ...prev, [key]: enabled };
      writeSeriesModeByManufacturer(next);
      return next;
    });
  };

  const openCreateSeries = (manufacturer: RepairManufacturer) => {
    if (!manufacturer.dbId) return;
    setSeriesFormManufacturer(manufacturer);
    setEditingSeries(null);
    setSeriesDialogOpen(true);
  };

  const openEditSeries = (series: RepairDeviceSeries) => {
    setEditingSeries(series);
    setSeriesFormManufacturer(null);
    setSeriesDialogOpen(true);
  };

  const handleDeleteSeries = (series: RepairDeviceSeries) => {
    if (!series.dbId) return;
    setDeleteTarget({ type: "series", item: series });
  };

  const openAddDevice = (seriesDbId?: number) => {
    setEditingDevice(null);
    setPendingDeviceSeriesId(seriesDbId ?? null);
    setDeviceDialogOpen(true);
  };

  const handleRemoveDeviceFromSeries = (device: RepairDevice) => {
    if (!device.dbId) return;
    updateDevice?.mutate({
      id: device.dbId,
      payload: { repairDeviceSeriesId: null },
    });
  };

  const handleAssignDevicesToSeries = async (deviceDbIds: number[]) => {
    if (!assignSeriesTarget?.dbId || !updateDevice) return;
    try {
      await Promise.all(
        deviceDbIds.map((id) =>
          updateDevice.mutateAsync({
            id,
            payload: { repairDeviceSeriesId: assignSeriesTarget.dbId },
          }),
        ),
      );
      setAssignSeriesTarget(null);
    } catch {
      // Errors surfaced by mutation hooks
    }
  };

  const openEditDevice = (device: RepairDevice) => {
    setEditingDevice(device);
    setDeviceDialogOpen(true);
  };

  const handleDeleteDevice = (device: RepairDevice) => {
    if (!device.dbId) return;
    setDeleteTarget({ type: "device", item: device });
  };

  const openAddIssue = () => {
    setEditingIssue(null);
    setIssueDialogOpen(true);
  };

  const openEditIssue = (issue: RepairProblem) => {
    setEditingIssue(issue);
    setIssueDialogOpen(true);
  };

  const handleDeleteIssue = (issue: RepairProblem) => {
    if (!issue.dbId) return;
    setDeleteTarget({ type: "issue", item: issue });
  };

  const openAddPart = () => {
    setEditingPart(null);
    setPartDialogOpen(true);
  };

  const openEditPart = (part: RepairPart) => {
    setEditingPart(part);
    setPartDialogOpen(true);
  };

  const handleDeletePart = (part: RepairPart) => {
    if (!part.dbId) return;
    setDeleteTarget({ type: "part", item: part });
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === "category") {
      const category = deleteTarget.item;
      if (!category.dbId) return;

      if (!deleteCategory) return;
      deleteCategory.mutate(category.dbId, {
        onSuccess: () => {
          setDeleteTarget(null);
          if (selectedCategoryId === category.id) {
            setSelectedCategoryId(null);
            setSelectedCategory(null);
            setSelectedManufacturerId(null);
            setSelectedDeviceId(null);
            setActiveStep("Category");
            setFurthestStep("Category");
          }
        },
      });
      return;
    }

    if (deleteTarget.type === "manufacturer") {
    const manufacturer = deleteTarget.item;
    if (!manufacturer.dbId) return;

    if (!deleteManufacturer) return;
    deleteManufacturer.mutate(manufacturer.dbId, {
      onSuccess: () => {
        setDeleteTarget(null);
          const modeKey = getManufacturerSeriesModeKey(manufacturer);
          setSeriesModeByManufacturer((prev) => {
            if (!(modeKey in prev)) return prev;
            const next = { ...prev };
            delete next[modeKey];
            writeSeriesModeByManufacturer(next);
            return next;
          });
        if (selectedManufacturerId === manufacturer.id) {
          setSelectedManufacturerId(null);
          setSelectedDeviceId(null);
          setSelectedProblemIds([]);
          setSelectedPartIds([]);
          setActiveStep("Manufacturer");
          setFurthestStep("Manufacturer");
        }
        },
      });
      return;
    }

    if (deleteTarget.type === "series") {
      const series = deleteTarget.item;
      if (!series.dbId) return;

      if (!deleteDeviceSeries) return;
      deleteDeviceSeries.mutate(series.dbId, {
        onSuccess: () => setDeleteTarget(null),
      });
      return;
    }

    if (deleteTarget.type === "device") {
      const device = deleteTarget.item;
      if (!device.dbId) return;

      if (!deleteDevice) return;
      deleteDevice.mutate(device.dbId, {
        onSuccess: () => {
          setDeleteTarget(null);
          if (selectedDeviceId === device.id) {
            setSelectedDeviceId(null);
            setSelectedProblemIds([]);
            setSelectedPartIds([]);
            setActiveStep("Devices");
            setFurthestStep("Devices");
          }
        },
      });
      return;
    }

    if (deleteTarget.type === "issue") {
      const issue = deleteTarget.item;
      if (!issue.dbId || !deleteIssue) return;

      deleteIssue.mutate(issue.dbId, {
        onSuccess: () => {
          setDeleteTarget(null);
          setSelectedProblemIds((prev) => prev.filter((id) => id !== issue.id));
        },
      });
      return;
    }

    const part = deleteTarget.item;
    if (!part.dbId || !deletePart) return;

    deletePart.mutate(part.dbId, {
      onSuccess: () => {
        setDeleteTarget(null);
        setSelectedPartIds((prev) => prev.filter((id) => id !== part.id));
      },
    });
  };

  const handleSelectCategory = (category: RepairCategoryCard) => {
    if (category.isAdd) {
      openAddCategory();
      return;
    }
    setSelectedCategoryId(category.id);
    setSelectedCategory(category.label);
    setSelectedManufacturerId(null);
    setSelectedDeviceId(null);
    setSelectedProblemIds([]);
    setSelectedPartIds([]);
    setActiveStep("Manufacturer");
    setFurthestStep("Manufacturer");
  };

  const openAddManufacturer = () => {
    if (!selectedCategoryDbId) {
      toast.error("Select a category first");
      return;
    }
    setEditingManufacturer(null);
    setManufacturerDialogOpen(true);
  };

  const openEditManufacturer = (manufacturer: RepairManufacturer) => {
    setEditingManufacturer(manufacturer);
    setManufacturerDialogOpen(true);
  };

  const handleSelectManufacturer = (manufacturer: RepairManufacturer) => {
    if (manufacturer.isAdd) {
      openAddManufacturer();
      return;
    }
    setSelectedManufacturerId(manufacturer.id);
    setSelectedDeviceId(null);
    setSelectedProblemIds([]);
    setSelectedPartIds([]);
    const next = getNextRepairStep("Manufacturer");
    if (next) {
      setActiveStep(next);
      setFurthestStep(next);
    }
  };

  const handleSelectDevice = (deviceId: string) => {
    if (isAddDeviceInList(deviceId, devices)) return;
    setSelectedDeviceId(deviceId);
    setSelectedProblemIds([]);
    setSelectedPartIds([]);
    const next = getNextRepairStep("Devices");
    if (next) {
      setFurthestStep(next);
      setActiveStep(next);
    }
  };

  const handleToggleProblem = (problemId: string) => {
    setSelectedProblemIds((prev) =>
      prev.includes(problemId)
        ? prev.filter((id) => id !== problemId)
        : [...prev, problemId],
    );
  };

  const handleProblemsNext = () => {
    setActiveStep("Parts");
    setFurthestStep((prev) =>
      getRepairStepIndex(prev) >= getRepairStepIndex("Parts") ? prev : "Parts",
    );
  };

  const handleTogglePart = (partId: string) => {
    setSelectedPartIds((prev) =>
      prev.includes(partId) ? prev.filter((id) => id !== partId) : [...prev, partId],
    );
  };

  const handlePartsNext = () => {
    setActiveStep("Details");
    setFurthestStep((prev) =>
      getRepairStepIndex(prev) >= getRepairStepIndex("Details") ? prev : "Details",
    );
  };


  const handleRepairSearchSelect = (selection: RepairSearchSelection) => {
    const category = categories.find(
      (c) => c.id === selection.categorySlug && !c.isAdd,
    );
    if (!category) {
      toast.error("Repair category not found for this device");
      return;
    }

    setSelectedCategoryId(category.id);
    setSelectedCategory(category.label);
    setSelectedManufacturerId(selection.manufacturerSlug);
    setSelectedDeviceId(selection.deviceCatalogKey ?? `device-${selection.deviceId}`);
    setSelectedProblemIds(
      selection.problemCatalogKey ? [selection.problemCatalogKey] : [],
    );
    setSelectedPartIds([]);
    setActiveStep("Problems");
    setFurthestStep("Problems");
    deepLinkKeyRef.current = `${selection.deviceId}-${selection.repairTypeId}`;
    toast.success(`${selection.repairName} — ${selection.deviceName}`);

    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("deviceId", String(selection.deviceId));
      url.searchParams.set("repairTypeId", String(selection.repairTypeId));
      window.history.replaceState(null, "", url.pathname + url.search);
    }
  };

  const handleStepChange = (step: RepairStep) => {
    if (!canNavigateToRepairStep(step, furthestStep)) return;
    setActiveStep(step);
    if (step === "Category") {
      setSelectedCategoryId(null);
      setSelectedCategory(null);
      setSelectedManufacturerId(null);
      setSelectedDeviceId(null);
      setSelectedProblemIds([]);
      setSelectedPartIds([]);
      setFurthestStep("Category");
    } else if (step === "Manufacturer") {
      setSelectedDeviceId(null);
      setSelectedProblemIds([]);
      setSelectedPartIds([]);
    }
  };

  useEffect(() => {
    const deviceId = Number(searchParams.get("deviceId"));
    const repairTypeId = Number(searchParams.get("repairTypeId"));
    if (!Number.isFinite(deviceId) || !Number.isFinite(repairTypeId)) return;
    if (deviceId < 1 || repairTypeId < 1) return;

    const key = `${deviceId}-${repairTypeId}`;
    if (deepLinkKeyRef.current === key) return;

    let cancelled = false;

    void fetchRepairBookingContext(shopId, deviceId, repairTypeId)
      .then((ctx) => {
        if (cancelled) return;
        deepLinkKeyRef.current = key;
        handleRepairSearchSelect({
          deviceId: ctx.device_id,
          repairTypeId: ctx.repair_type_id,
          deviceCatalogKey: ctx.device_catalog_key,
          problemCatalogKey: ctx.catalog_key,
          categorySlug: ctx.category_slug,
          manufacturerSlug: ctx.manufacturer_slug,
          deviceName: ctx.device_name,
          repairName: ctx.repair_name,
        });
      })
      .catch(() => {
        if (!cancelled) toast.error("Could not load repair booking details");
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- deep link once on mount
  }, [searchParams, shopId]);

  useEffect(() => {
    if (categoriesError) {
      toast.error("Could not load repair categories. Using defaults.");
    }
  }, [categoriesError]);

  const manufacturersQueryErrorRef = useRef(manufacturersQueryError);
  manufacturersQueryErrorRef.current = manufacturersQueryError;

  useEffect(() => {
    if (!manufacturersError || manufacturersLoading) return;
    toast.error(
      getApiErrorMessage(
        manufacturersQueryErrorRef.current,
        "Could not load manufacturers. Using defaults. Check that the backend is running and the database is connected.",
      ),
    );
  }, [manufacturersError, manufacturersLoading]);

  useEffect(() => {
    if (devicesError) {
      toast.error("Could not load devices.");
    }
  }, [devicesError]);

  useEffect(() => {
    if (problemsError) {
      toast.error(
        getApiErrorMessage(
          problemsQueryError,
          "Could not load device issues. Restart the backend after running: npm run db:generate",
        ),
      );
    }
  }, [problemsError, problemsQueryError]);

  useEffect(() => {
    if (partsError) {
      toast.error(
        getApiErrorMessage(
          partsQueryError,
          "Could not load repair parts. Restart the backend after running: npm run db:generate",
        ),
      );
    }
  }, [partsError, partsQueryError]);

  const manufacturerPrefetchKey = useMemo(() => {
    if (categoriesLoading || categoriesError || selectedCategoryDbId == null) {
      return null;
    }
    return `${shopId}:${selectedCategoryDbId}`;
  }, [categoriesLoading, categoriesError, selectedCategoryDbId, shopId]);

  useEffect(() => {
    if (manufacturerPrefetchKey == null) return;
    const [, categoryIdStr] = manufacturerPrefetchKey.split(":");
    const categoryDbId = Number(categoryIdStr);
    if (!Number.isFinite(categoryDbId) || categoryDbId < 1) return;

    let cancelled = false;
    void import("@/services/repair-manufacturers.service").then(
      ({ fetchRepairManufacturers }) => {
        if (cancelled) return;
        void queryClient.prefetchQuery({
          queryKey: queryKeys.repairManufacturers.list(shopId, categoryDbId),
          queryFn: () => fetchRepairManufacturers(shopId, categoryDbId),
          staleTime: 10 * 60 * 1000,
        });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [manufacturerPrefetchKey, queryClient, shopId]);

  const onProviderPropsChangeRef = useRef(onProviderPropsChange);
  onProviderPropsChangeRef.current = onProviderPropsChange;

  useEffect(() => {
    onProviderPropsChangeRef.current({
      selectedCategoryId,
      selectedCategoryLabel: selectedCategory,
      selectedManufacturerId,
      selectedDeviceId,
      selectedProblemIds,
      selectedPartIds,
      devices,
      manufacturers,
      problems,
      parts,
    });
  }, [
    selectedCategoryId,
    selectedCategory,
    selectedManufacturerId,
    selectedDeviceId,
    selectedProblemIds,
    selectedPartIds,
    devices,
    manufacturers,
    problems,
    parts,
  ]);

  return (
    <>
      {loadCatalogData ? (
        <RepairsWorkspaceCategoryData
          shopId={shopId}
          onSnapshot={handleCategorySnapshot}
        />
      ) : null}
      {loadManufacturerData && selectedCategoryDbId ? (
        <RepairsWorkspaceManufacturerData
          shopId={shopId}
          selectedCategoryDbId={selectedCategoryDbId}
          onSnapshot={handleManufacturerSnapshot}
        />
      ) : null}
      {loadDevicesData && selectedCategoryDbId && selectedManufacturerDbId ? (
        <RepairsWorkspaceDevicesData
          shopId={shopId}
          selectedCategoryDbId={selectedCategoryDbId}
          selectedManufacturerDbId={selectedManufacturerDbId}
          seriesFormManufacturerDbId={
            seriesFormManufacturerDbId ?? selectedManufacturerDbId
          }
          onSnapshot={handleDevicesSnapshot}
        />
      ) : null}
      {loadDeviceData && selectedCategoryDbId && selectedManufacturerDbId && selectedDeviceDbId ? (
        <RepairsWorkspaceDeviceData
          shopId={shopId}
          selectedCategoryDbId={selectedCategoryDbId}
          selectedManufacturerDbId={selectedManufacturerDbId}
          selectedDeviceDbId={selectedDeviceDbId}
          onSnapshot={handleDeviceDataSnapshot}
        />
      ) : null}
              <RepairsWorkflowWithConfirm
                categories={categories}
                categoriesLoading={categoriesLoading}
                selectedCategory={selectedCategory}
                selectedCategoryId={selectedCategoryId}
                activeStep={activeStep}
                selectedManufacturerId={selectedManufacturerId}
                selectedDeviceId={selectedDeviceId}
                devices={devices}
                devicesLoading={devicesLoading}
                furthestStep={furthestStep}
                onStepChange={handleStepChange}
                onSelectCategory={handleSelectCategory}
                onEditCategory={openEditCategory}
                onDeleteCategory={handleDeleteCategory}
                manufacturers={manufacturers}
                manufacturersLoading={manufacturersLoading}
                onSelectManufacturer={handleSelectManufacturer}
                onEditManufacturer={openEditManufacturer}
                onDeleteManufacturer={handleDeleteManufacturer}
                onCreateSeries={openCreateSeries}
                seriesModeByManufacturer={seriesModeByManufacturer}
                onSeriesModeChange={handleSeriesModeChange}
                deviceSeries={deviceSeries}
                deviceSeriesLoading={deviceSeriesLoading}
                onCreateSeriesFromDevices={() => {
                  const m = manufacturers.find(
                    (item) => item.id === selectedManufacturerId && !item.isAdd,
                  );
                  if (m) openCreateSeries(m);
                }}
                onEditSeries={openEditSeries}
                onDeleteSeries={handleDeleteSeries}
                onAssignDevicesToSeries={setAssignSeriesTarget}
                onRemoveDeviceFromSeries={handleRemoveDeviceFromSeries}
                onAddDeviceToSeries={openAddDevice}
                onSelectDevice={handleSelectDevice}
                onAddDevice={() => openAddDevice()}
                onEditDevice={openEditDevice}
                onDeleteDevice={handleDeleteDevice}
                problems={problems}
                problemsLoading={problemsLoading}
                selectedProblemIds={selectedProblemIds}
                onToggleProblem={handleToggleProblem}
                onProblemsNext={handleProblemsNext}
                onAddIssue={openAddIssue}
                onEditIssue={openEditIssue}
                onDeleteIssue={handleDeleteIssue}
                parts={parts}
                partsLoading={partsLoading}
                selectedPartIds={selectedPartIds}
                onTogglePart={handleTogglePart}
                onPartsNext={handlePartsNext}
                onAddPart={openAddPart}
                onEditPart={openEditPart}
                onDeletePart={handleDeletePart}
                initialRepairCharges={initialRepairCharges}
                shopId={shopId}
                onSearchSelect={handleRepairSearchSelect}
              />

      {selectedCategoryDbId && createManufacturer && updateManufacturer ? (
        <RepairManufacturerFormDialog
          open={manufacturerDialogOpen}
          onOpenChange={(open) => {
            setManufacturerDialogOpen(open);
            if (!open) setEditingManufacturer(null);
          }}
          repairCategoryId={selectedCategoryDbId}
          manufacturer={editingManufacturer}
          isSubmitting={createManufacturer.isPending || updateManufacturer.isPending}
          onSave={(values) => {
            if (editingManufacturer?.dbId) {
              updateManufacturer.mutate(
                { id: editingManufacturer.dbId, payload: values },
                {
                  onSuccess: () => {
                    setManufacturerDialogOpen(false);
                    setEditingManufacturer(null);
                  },
                },
              );
            } else {
              createManufacturer.mutate(values, {
                onSuccess: () => {
                  setManufacturerDialogOpen(false);
                },
              });
            }
          }}
        />
      ) : null}

      {selectedCategoryDbId &&
      selectedManufacturerDbId &&
      createDevice &&
      updateDevice ? (
        <RepairDeviceFormDialog
          open={deviceDialogOpen}
          onOpenChange={(open) => {
            setDeviceDialogOpen(open);
            if (!open) {
              setEditingDevice(null);
              setPendingDeviceSeriesId(null);
            }
          }}
          repairCategoryId={selectedCategoryDbId}
          repairManufacturerId={selectedManufacturerDbId}
          categoryId={selectedCategoryId}
          device={editingDevice}
          isSubmitting={createDevice.isPending || updateDevice.isPending}
          onSave={(values) => {
            if (editingDevice?.dbId) {
              updateDevice.mutate(
                { id: editingDevice.dbId, payload: values },
                {
                  onSuccess: () => {
                    setDeviceDialogOpen(false);
                    setEditingDevice(null);
                  },
                },
              );
            } else {
              createDevice.mutate(
                {
                  ...values,
                  repairDeviceSeriesId: pendingDeviceSeriesId,
                },
                {
                  onSuccess: () => {
                    setDeviceDialogOpen(false);
                    setPendingDeviceSeriesId(null);
                  },
                },
              );
            }
          }}
        />
      ) : null}

      {selectedCategoryDbId &&
      seriesFormManufacturerDbId &&
      createDeviceSeries &&
      updateDeviceSeries ? (
        <RepairDeviceSeriesFormDialog
          open={seriesDialogOpen}
          onOpenChange={(open) => {
            setSeriesDialogOpen(open);
            if (!open) {
              setEditingSeries(null);
              setSeriesFormManufacturer(null);
            }
          }}
          manufacturerName={
            seriesFormManufacturer?.name ??
            manufacturers.find((m) => m.id === selectedManufacturerId)?.name
          }
          series={editingSeries}
          isSubmitting={
            createDeviceSeries.isPending || updateDeviceSeries.isPending
          }
          onSave={(values) => {
            if (editingSeries?.dbId) {
              updateDeviceSeries.mutate(
                { id: editingSeries.dbId, payload: values },
                {
                  onSuccess: () => {
                    setSeriesDialogOpen(false);
                    setEditingSeries(null);
                  },
                },
              );
            } else {
              const manufacturerDbId = seriesFormManufacturerDbId;
              if (!manufacturerDbId) return;
              createDeviceSeries.mutate(
                { ...values, repairManufacturerId: manufacturerDbId },
                {
                  onSuccess: () => {
                    setSeriesDialogOpen(false);
                    setSeriesFormManufacturer(null);
                  },
                },
              );
            }
          }}
        />
      ) : null}

      {assignSeriesTarget ? (
        <RepairsAssignDevicesDialog
          open={assignSeriesTarget !== null}
          onOpenChange={(open) => {
            if (!open) setAssignSeriesTarget(null);
          }}
          seriesName={assignSeriesTarget.name}
          devices={devices}
          assignedDeviceDbIds={
            assignSeriesTarget.dbId
              ? devices
                  .filter(
                    (d) =>
                      !d.isAdd &&
                      d.dbId != null &&
                      d.repairDeviceSeriesId === assignSeriesTarget.dbId,
                  )
                  .map((d) => d.dbId!)
              : []
          }
          isSubmitting={updateDevice?.isPending ?? false}
          onAssign={handleAssignDevicesToSeries}
        />
      ) : null}

      {selectedCategoryDbId &&
      selectedManufacturerDbId &&
      selectedDeviceDbId &&
      createIssue &&
      updateIssue ? (
        <RepairDeviceIssueFormDialog
          open={issueDialogOpen}
          onOpenChange={(open) => {
            setIssueDialogOpen(open);
            if (!open) setEditingIssue(null);
          }}
          repairCategoryId={selectedCategoryDbId}
          repairManufacturerId={selectedManufacturerDbId}
          repairDeviceId={selectedDeviceDbId}
          issue={editingIssue}
          isSubmitting={createIssue.isPending || updateIssue.isPending}
          onSave={(values) => {
            if (editingIssue?.dbId) {
              updateIssue.mutate(
                { id: editingIssue.dbId, payload: values },
                {
                  onSuccess: () => {
                    setIssueDialogOpen(false);
                    setEditingIssue(null);
                  },
                },
              );
            } else {
              createIssue.mutate(values, {
                onSuccess: () => {
                  setIssueDialogOpen(false);
                },
              });
            }
          }}
        />
      ) : null}

      {selectedCategoryDbId &&
      selectedManufacturerDbId &&
      selectedDeviceDbId &&
      createPart &&
      updatePart ? (
        <RepairDevicePartFormDialog
          open={partDialogOpen}
          onOpenChange={(open) => {
            setPartDialogOpen(open);
            if (!open) setEditingPart(null);
          }}
          repairCategoryId={selectedCategoryDbId}
          repairManufacturerId={selectedManufacturerDbId}
          repairDeviceId={selectedDeviceDbId}
          part={editingPart}
          isSubmitting={createPart.isPending || updatePart.isPending}
          onSave={(values) => {
            if (editingPart?.dbId) {
              updatePart.mutate(
                { id: editingPart.dbId, payload: values },
                {
                  onSuccess: () => {
                    setPartDialogOpen(false);
                    setEditingPart(null);
                  },
                },
              );
            } else {
              createPart.mutate(values, {
                onSuccess: () => {
                  setPartDialogOpen(false);
                },
              });
            }
          }}
        />
      ) : null}

      {createCategory && updateCategory ? (
      <RepairCategoryFormDialog
        open={categoryDialogOpen}
        onOpenChange={(open) => {
          setCategoryDialogOpen(open);
          if (!open) setEditingCategory(null);
        }}
        category={editingCategory}
        isSubmitting={createCategory.isPending || updateCategory.isPending}
        onSave={(values) => {
          if (editingCategory?.dbId) {
            updateCategory.mutate(
              { id: editingCategory.dbId, payload: values },
              {
                onSuccess: (data) => {
                  setCategoryDialogOpen(false);
                  setEditingCategory(null);
                  if (selectedCategoryId === editingCategory.id) {
                    setSelectedCategory(data.name);
                  }
                },
              },
            );
          } else {
            createCategory.mutate(values, {
              onSuccess: () => {
                setCategoryDialogOpen(false);
              },
            });
          }
        }}
      />
      ) : null}

      <DeleteUserDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (
            !open &&
            !deleteCategory?.isPending &&
            !deleteManufacturer?.isPending &&
            !deleteDeviceSeries?.isPending &&
            !deleteDevice?.isPending &&
            !deleteIssue?.isPending &&
            !deletePart?.isPending
          ) {
            setDeleteTarget(null);
          }
        }}
        entityType={
          deleteTarget?.type === "category"
            ? "category"
            : deleteTarget?.type === "manufacturer"
              ? "manufacturer"
              : deleteTarget?.type === "series"
                ? "series"
                : deleteTarget?.type === "device"
                ? "device"
                : deleteTarget?.type === "issue"
                  ? "device issue"
                  : "part"
        }
        itemLabel={
          deleteTarget?.type === "category"
            ? deleteTarget.item.label
            : (deleteTarget?.item.name ?? "")
        }
        isPending={
          (deleteCategory?.isPending ?? false) ||
          (deleteManufacturer?.isPending ?? false) ||
          (deleteDeviceSeries?.isPending ?? false) ||
          (deleteDevice?.isPending ?? false) ||
          (deleteIssue?.isPending ?? false) ||
          (deletePart?.isPending ?? false)
        }
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}

export function RepairsPosWorkspaceInner(props: RepairsPosWorkspaceCoreProps) {
  return <RepairsPosWorkspaceCoreInner {...props} />;
}

type RepairsWorkflowWithConfirmProps = Omit<
  ComponentProps<typeof RepairsWorkflowPanel>,
  "onConfirmDetails"
>;

function RepairsWorkflowWithConfirm(props: RepairsWorkflowWithConfirmProps) {
  const { confirmTicket } = useRepairTicket();

  return (
    <RepairsWorkflowPanel
      {...props}
      onConfirmDetails={(values) => {
        confirmTicket(values);
        toast.success("Repair ticket confirmed", {
          description: `Total ${formatCurrency(Number.parseFloat(values.repairCharges) || 0)} · Assigned to ${values.assignedTo}. See the cart on the left.`,
        });
      }}
    />
  );
}

