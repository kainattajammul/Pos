"use client";

import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/axios";
import { queryKeys } from "@/constants/query-keys";
import { fetchRepairManufacturers } from "@/services/repair-manufacturers.service";
import { APP_CONFIG } from "@/constants/config";
import {
  useCreateRepairCategory,
  useDeleteRepairCategory,
  useRepairCategories,
  useUpdateRepairCategory,
} from "@/hooks/use-repair-categories";
import {
  useCreateRepairManufacturer,
  useDeleteRepairManufacturer,
  useRepairManufacturers,
  useUpdateRepairManufacturer,
} from "@/hooks/use-repair-manufacturers";
import {
  useCreateRepairDevice,
  useDeleteRepairDevice,
  useRepairDevices,
  useUpdateRepairDevice,
} from "@/hooks/use-repair-devices";
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
import type {
  PosTab,
  RepairCategoryCard,
  RepairDevice,
  RepairManufacturer,
  RepairStep,
} from "@/lib/repairs-pos-data";
import type { RepairProblem } from "@/lib/repairs-problems-data";
import { REPAIR_PROBLEMS_FALLBACK } from "@/lib/repairs-problems-data";
import type { RepairPart } from "@/lib/repairs-parts-data";
import { REPAIR_PARTS_FALLBACK } from "@/lib/repairs-parts-data";
import {
  getDefaultRepairCharges,
  type RepairDetailsFormValues,
} from "@/lib/repairs-details-data";
import {
  canNavigateToRepairStep,
  getNextRepairStep,
  getRepairStepIndex,
  isAddDeviceInList,
} from "@/lib/repairs-pos-data";
import { REPAIR_DEVICES_FALLBACK } from "@/lib/repairs-devices-data";
import { RepairsTopNav } from "@/components/repairs/repairs-top-nav";
import { RepairsPosBar } from "@/components/repairs/repairs-pos-bar";
import { RepairsCartPanel } from "@/components/repairs/repairs-cart-panel";
import { RepairsSideToolbar } from "@/components/repairs/repairs-side-toolbar";
import { DeleteUserDialog } from "@/components/users/delete-user-dialog";

const RepairsWorkflowPanel = dynamic(
  () =>
    import("@/components/repairs/repairs-workflow-panel").then(
      (m) => m.RepairsWorkflowPanel,
    ),
  { ssr: false },
);
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

const LOADING_CATEGORIES: RepairCategoryCard[] = [];
const LOADING_MANUFACTURERS: RepairManufacturer[] = [
  { id: "add", name: "Add Manufacturer", isAdd: true },
];
import { RepairTicketProvider } from "@/contexts/repair-ticket-context";

type DeleteTarget =
  | { type: "category"; item: RepairCategoryCard }
  | { type: "manufacturer"; item: RepairManufacturer }
  | { type: "device"; item: RepairDevice }
  | { type: "issue"; item: RepairProblem }
  | { type: "part"; item: RepairPart };

function RepairsPosContent() {
  const shopId = APP_CONFIG.defaultShopId;
  const queryClient = useQueryClient();
  const {
    data: categories = LOADING_CATEGORIES,
    isLoading: categoriesLoading,
    isError: categoriesError,
  } = useRepairCategories(shopId);
  const createCategory = useCreateRepairCategory(shopId);
  const updateCategory = useUpdateRepairCategory(shopId);
  const deleteCategory = useDeleteRepairCategory(shopId);
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
  const [activeTab, setActiveTab] = useState<PosTab>("Repairs");
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

  const selectedCategoryDbId = useMemo(() => {
    const match = categories.find((c) => c.id === selectedCategoryId && !c.isAdd);
    return match?.dbId ?? null;
  }, [categories, selectedCategoryId]);

  const {
    data: manufacturers = LOADING_MANUFACTURERS,
    isLoading: manufacturersLoading,
    isError: manufacturersError,
  } = useRepairManufacturers(shopId, selectedCategoryDbId);

  const createManufacturer = useCreateRepairManufacturer(
    shopId,
    selectedCategoryDbId ?? 0,
  );
  const updateManufacturer = useUpdateRepairManufacturer(
    shopId,
    selectedCategoryDbId ?? 0,
  );
  const deleteManufacturer = useDeleteRepairManufacturer(
    shopId,
    selectedCategoryDbId ?? 0,
  );

  const selectedManufacturerDbId = useMemo(() => {
    const match = manufacturers.find(
      (m) => m.id === selectedManufacturerId && !m.isAdd,
    );
    return match?.dbId ?? null;
  }, [manufacturers, selectedManufacturerId]);

  const {
    data: devices = REPAIR_DEVICES_FALLBACK,
    isLoading: devicesLoading,
    isError: devicesError,
  } = useRepairDevices(shopId, selectedCategoryDbId, selectedManufacturerDbId);

  const createDevice = useCreateRepairDevice(
    shopId,
    selectedCategoryDbId ?? 0,
    selectedManufacturerDbId ?? 0,
  );
  const updateDevice = useUpdateRepairDevice(
    shopId,
    selectedCategoryDbId ?? 0,
    selectedManufacturerDbId ?? 0,
  );
  const deleteDevice = useDeleteRepairDevice(
    shopId,
    selectedCategoryDbId ?? 0,
    selectedManufacturerDbId ?? 0,
  );

  const selectedDeviceDbId = useMemo(() => {
    const match = devices.find((d) => d.id === selectedDeviceId && !d.isAdd);
    return match?.dbId ?? null;
  }, [devices, selectedDeviceId]);

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
    selectedCategoryDbId ?? 0,
    selectedManufacturerDbId ?? 0,
    selectedDeviceDbId ?? 0,
  );
  const updateIssue = useUpdateRepairDeviceIssue(
    shopId,
    selectedCategoryDbId ?? 0,
    selectedManufacturerDbId ?? 0,
    selectedDeviceDbId ?? 0,
  );
  const deleteIssue = useDeleteRepairDeviceIssue(
    shopId,
    selectedCategoryDbId ?? 0,
    selectedManufacturerDbId ?? 0,
    selectedDeviceDbId ?? 0,
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
    selectedCategoryDbId ?? 0,
    selectedManufacturerDbId ?? 0,
    selectedDeviceDbId ?? 0,
  );
  const updatePart = useUpdateRepairDevicePart(
    shopId,
    selectedCategoryDbId ?? 0,
    selectedManufacturerDbId ?? 0,
    selectedDeviceDbId ?? 0,
  );
  const deletePart = useDeleteRepairDevicePart(
    shopId,
    selectedCategoryDbId ?? 0,
    selectedManufacturerDbId ?? 0,
    selectedDeviceDbId ?? 0,
  );

  const initialRepairCharges = useMemo(
    () => getDefaultRepairCharges(selectedProblemIds, problems),
    [selectedProblemIds, problems],
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

  const openAddDevice = () => {
    setEditingDevice(null);
    setDeviceDialogOpen(true);
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

      deleteManufacturer.mutate(manufacturer.dbId, {
        onSuccess: () => {
          setDeleteTarget(null);
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

    if (deleteTarget.type === "device") {
      const device = deleteTarget.item;
      if (!device.dbId) return;

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
      if (!issue.dbId) return;

      deleteIssue.mutate(issue.dbId, {
        onSuccess: () => {
          setDeleteTarget(null);
          setSelectedProblemIds((prev) => prev.filter((id) => id !== issue.id));
        },
      });
      return;
    }

    const part = deleteTarget.item;
    if (!part.dbId) return;

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

  const handleConfirmDetails = (values: RepairDetailsFormValues) => {
    toast.success("Repair details confirmed", {
      description: `Charges: $${values.repairCharges} · Assigned to ${values.assignedTo}`,
    });
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
    if (categoriesError) {
      toast.error("Could not load repair categories. Using defaults.");
    }
  }, [categoriesError]);

  useEffect(() => {
    if (manufacturersError) {
      toast.error("Could not load manufacturers. Using defaults.");
    }
  }, [manufacturersError]);

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

  useEffect(() => {
    if (categoriesLoading || categories.length === 0) return;
    for (const category of categories) {
      if (category.isAdd || !category.dbId) continue;
      void queryClient.prefetchQuery({
        queryKey: queryKeys.repairManufacturers.list(shopId, category.dbId),
        queryFn: () => fetchRepairManufacturers(shopId, category.dbId),
        staleTime: 10 * 60 * 1000,
      });
    }
  }, [categories, categoriesLoading, queryClient, shopId]);

  return (
    <div className="repairs-pos-theme flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-[#F8FAFC]">
      <RepairsTopNav />
      <RepairsPosBar activeTab={activeTab} onTabChange={setActiveTab} />

      <RepairTicketProvider
        selectedCategoryId={selectedCategoryId}
        selectedManufacturerId={selectedManufacturerId}
        selectedDeviceId={selectedDeviceId}
        selectedProblemIds={selectedProblemIds}
        devices={devices}
        manufacturers={manufacturers}
        problems={problems}
      >
        <div className="flex min-h-0 flex-1 overflow-hidden">
          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden lg:flex-row">
            <RepairsCartPanel />
            <RepairsWorkflowPanel
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
              onSelectDevice={handleSelectDevice}
              onAddDevice={openAddDevice}
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
              onConfirmDetails={handleConfirmDetails}
            />
          </div>
          <RepairsSideToolbar />
        </div>
      </RepairTicketProvider>

      {selectedCategoryDbId ? (
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

      {selectedCategoryDbId && selectedManufacturerDbId ? (
        <RepairDeviceFormDialog
          open={deviceDialogOpen}
          onOpenChange={(open) => {
            setDeviceDialogOpen(open);
            if (!open) setEditingDevice(null);
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
              createDevice.mutate(values, {
                onSuccess: () => {
                  setDeviceDialogOpen(false);
                },
              });
            }
          }}
        />
      ) : null}

      {selectedCategoryDbId && selectedManufacturerDbId && selectedDeviceDbId ? (
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

      {selectedCategoryDbId && selectedManufacturerDbId && selectedDeviceDbId ? (
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

      <DeleteUserDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (
            !open &&
            !deleteCategory.isPending &&
            !deleteManufacturer.isPending &&
            !deleteDevice.isPending &&
            !deleteIssue.isPending &&
            !deletePart.isPending
          ) {
            setDeleteTarget(null);
          }
        }}
        entityType={
          deleteTarget?.type === "category"
            ? "category"
            : deleteTarget?.type === "manufacturer"
              ? "manufacturer"
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
          deleteCategory.isPending ||
          deleteManufacturer.isPending ||
          deleteDevice.isPending ||
          deleteIssue.isPending ||
          deletePart.isPending
        }
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

export function RepairsPosView() {
  return <RepairsPosContent />;
}
