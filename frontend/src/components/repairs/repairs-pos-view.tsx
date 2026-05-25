"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { toast } from "sonner";
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
import type {
  PosTab,
  RepairCategoryCard,
  RepairManufacturer,
  RepairStep,
} from "@/lib/repairs-pos-data";
import { REPAIR_CATEGORIES, REPAIR_MANUFACTURERS } from "@/lib/repairs-pos-data";
import {
  getDefaultRepairCharges,
  type RepairDetailsFormValues,
} from "@/lib/repairs-details-data";
import {
  canNavigateToRepairStep,
  getDevicesForCategoryAndManufacturer,
  getNextRepairStep,
  getRepairStepIndex,
  isAddDeviceId,
} from "@/lib/repairs-pos-data";
import { RepairsTopNav } from "@/components/repairs/repairs-top-nav";
import { RepairsPosBar } from "@/components/repairs/repairs-pos-bar";
import { RepairsCartPanel } from "@/components/repairs/repairs-cart-panel";
import { RepairsWorkflowPanel } from "@/components/repairs/repairs-workflow-panel";
import { RepairsSideToolbar } from "@/components/repairs/repairs-side-toolbar";
import { DeleteConfirmDialog } from "@/components/repairs/delete-confirm-dialog";
import { RepairCategoryFormDialog } from "@/components/repairs/repair-category-form-dialog";
import { RepairManufacturerFormDialog } from "@/components/repairs/repair-manufacturer-form-dialog";
import { RepairTicketProvider } from "@/contexts/repair-ticket-context";

type DeleteTarget =
  | { type: "category"; item: RepairCategoryCard }
  | { type: "manufacturer"; item: RepairManufacturer };

function RepairsPosContent() {
  const shopId = APP_CONFIG.defaultShopId;
  const {
    data: categories = REPAIR_CATEGORIES,
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
  const mainRef = useRef<HTMLDivElement>(null);

  const selectedCategoryDbId = useMemo(() => {
    const match = categories.find((c) => c.id === selectedCategoryId && !c.isAdd);
    return match?.dbId ?? null;
  }, [categories, selectedCategoryId]);

  const {
    data: manufacturers = REPAIR_MANUFACTURERS,
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

  const devices = getDevicesForCategoryAndManufacturer(
    selectedCategoryId,
    selectedManufacturerId,
  );

  const initialRepairCharges = useMemo(
    () => getDefaultRepairCharges(selectedProblemIds),
    [selectedProblemIds],
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
    if (isAddDeviceId(deviceId, selectedCategoryId, selectedManufacturerId)) return;
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
    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-pos-animate]",
        { opacity: 0, y: 10 },
        {
          opacity: 1,
          y: 0,
          duration: 0.45,
          stagger: 0.06,
          ease: "power2.out",
        },
      );
    }, mainRef);
    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={mainRef}
      className="repairs-pos-theme flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-[#F8FAFC]"
    >
      <div data-pos-animate>
        <RepairsTopNav />
      </div>
      <div data-pos-animate>
        <RepairsPosBar activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      <RepairTicketProvider
        selectedCategoryId={selectedCategoryId}
        selectedManufacturerId={selectedManufacturerId}
        selectedDeviceId={selectedDeviceId}
        selectedProblemIds={selectedProblemIds}
      >
        <div className="flex min-h-0 flex-1 overflow-hidden">
          <div
            data-pos-animate
            className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden lg:flex-row"
          >
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
              selectedProblemIds={selectedProblemIds}
              onToggleProblem={handleToggleProblem}
              onProblemsNext={handleProblemsNext}
              selectedPartIds={selectedPartIds}
              onTogglePart={handleTogglePart}
              onPartsNext={handlePartsNext}
              initialRepairCharges={initialRepairCharges}
              onConfirmDetails={handleConfirmDetails}
            />
          </div>
          <div data-pos-animate>
            <RepairsSideToolbar />
          </div>
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

      <DeleteConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title={
          deleteTarget?.type === "category"
            ? "Delete category"
            : "Delete manufacturer"
        }
        itemName={
          deleteTarget?.type === "category"
            ? deleteTarget.item.label
            : (deleteTarget?.item.name ?? "")
        }
        isDeleting={deleteCategory.isPending || deleteManufacturer.isPending}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

export function RepairsPosView() {
  return <RepairsPosContent />;
}
