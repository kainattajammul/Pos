"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { toast } from "sonner";
import type { PosTab, RepairCategoryCard, RepairStep } from "@/lib/repairs-pos-data";
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
import { RepairTicketProvider } from "@/contexts/repair-ticket-context";

function RepairsPosContent() {
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

  const devices = getDevicesForCategoryAndManufacturer(
    selectedCategoryId,
    selectedManufacturerId,
  );

  const initialRepairCharges = useMemo(
    () => getDefaultRepairCharges(selectedProblemIds),
    [selectedProblemIds],
  );

  const handleSelectCategory = (category: RepairCategoryCard) => {
    if (category.isAdd) return;
    setSelectedCategoryId(category.id);
    setSelectedCategory(category.label);
    setSelectedManufacturerId(null);
    setSelectedDeviceId(null);
    setSelectedProblemIds([]);
    setSelectedPartIds([]);
    setActiveStep("Manufacturer");
    setFurthestStep("Manufacturer");
  };

  const handleSelectManufacturer = (manufacturerId: string) => {
    if (manufacturerId === "add") return;
    setSelectedManufacturerId(manufacturerId);
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
              selectedCategory={selectedCategory}
              selectedCategoryId={selectedCategoryId}
              activeStep={activeStep}
              selectedManufacturerId={selectedManufacturerId}
              selectedDeviceId={selectedDeviceId}
              devices={devices}
              furthestStep={furthestStep}
              onStepChange={handleStepChange}
              onSelectCategory={handleSelectCategory}
              onSelectManufacturer={handleSelectManufacturer}
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
    </div>
  );
}

export function RepairsPosView() {
  return <RepairsPosContent />;
}
