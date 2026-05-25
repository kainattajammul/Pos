"use client";

import { useState } from "react";
import { ChevronRight, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import type {
  RepairCategoryCard,
  RepairDevice,
  RepairManufacturer,
  RepairStep,
  RepairWorkflowStep,
} from "@/lib/repairs-pos-data";
import type { RepairProblem } from "@/lib/repairs-problems-data";
import type { RepairPart } from "@/lib/repairs-parts-data";
import {
  canNavigateToRepairStep,
  getDeviceById,
  getManufacturerById,
} from "@/lib/repairs-pos-data";
import { ManufacturerBrandMark } from "@/components/repairs/manufacturer-brand-mark";
import { RepairsDevicesStep } from "@/components/repairs/repairs-devices-step";
import { RepairsDetailsStep } from "@/components/repairs/repairs-details-step";
import { RepairsPartsStep } from "@/components/repairs/repairs-parts-step";
import { RepairsProblemsStep } from "@/components/repairs/repairs-problems-step";
import { RepairsWorkflowActions } from "@/components/repairs/repairs-workflow-actions";
import { RepairsSearchBar } from "@/components/repairs/repairs-search-bar";
import { useRepairTicket } from "@/contexts/repair-ticket-context";
import type { RepairSearchSelection } from "@/types/repair-search";
import type { RepairDetailsFormValues } from "@/lib/repairs-details-data";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface RepairsWorkflowPanelProps {
  categories: RepairCategoryCard[];
  categoriesLoading?: boolean;
  selectedCategory: string | null;
  selectedCategoryId: string | null;
  activeStep: RepairStep;
  furthestStep: RepairStep;
  selectedManufacturerId: string | null;
  selectedDeviceId: string | null;
  devices: RepairDevice[];
  onStepChange: (step: RepairStep) => void;
  onSelectCategory: (category: RepairCategoryCard) => void;
  onEditCategory?: (category: RepairCategoryCard) => void;
  onDeleteCategory?: (category: RepairCategoryCard) => void;
  manufacturers: RepairManufacturer[];
  manufacturersLoading?: boolean;
  onSelectManufacturer: (manufacturer: RepairManufacturer) => void;
  onEditManufacturer?: (manufacturer: RepairManufacturer) => void;
  onDeleteManufacturer?: (manufacturer: RepairManufacturer) => void;
  devicesLoading?: boolean;
  onSelectDevice: (deviceId: string) => void;
  onAddDevice?: () => void;
  onEditDevice?: (device: RepairDevice) => void;
  onDeleteDevice?: (device: RepairDevice) => void;
  problems: RepairProblem[];
  problemsLoading?: boolean;
  selectedProblemIds: string[];
  onToggleProblem: (problemId: string) => void;
  onProblemsNext: () => void;
  onAddIssue?: () => void;
  onEditIssue?: (issue: RepairProblem) => void;
  onDeleteIssue?: (issue: RepairProblem) => void;
  parts: RepairPart[];
  partsLoading?: boolean;
  selectedPartIds: string[];
  onTogglePart: (partId: string) => void;
  onPartsNext: () => void;
  onAddPart?: () => void;
  onEditPart?: (part: RepairPart) => void;
  onDeletePart?: (part: RepairPart) => void;
  initialRepairCharges: string;
  onConfirmDetails: (values: RepairDetailsFormValues) => void;
  shopId: number;
  onSearchSelect: (selection: RepairSearchSelection) => void;
}

export function RepairsWorkflowPanel({
  categories,
  categoriesLoading = false,
  selectedCategory,
  selectedCategoryId,
  activeStep,
  furthestStep,
  selectedManufacturerId,
  selectedDeviceId,
  devices,
  onStepChange,
  onSelectCategory,
  onEditCategory,
  onDeleteCategory,
  manufacturers,
  manufacturersLoading = false,
  onSelectManufacturer,
  onEditManufacturer,
  onDeleteManufacturer,
  devicesLoading = false,
  onSelectDevice,
  onAddDevice,
  onEditDevice,
  onDeleteDevice,
  problems,
  problemsLoading = false,
  selectedProblemIds,
  onToggleProblem,
  onProblemsNext,
  onAddIssue,
  onEditIssue,
  onDeleteIssue,
  parts,
  partsLoading = false,
  selectedPartIds,
  onTogglePart,
  onPartsNext,
  onAddPart,
  onEditPart,
  onDeletePart,
  initialRepairCharges,
  onConfirmDetails,
  shopId,
  onSearchSelect,
}: RepairsWorkflowPanelProps) {
  const { setDetailsForm } = useRepairTicket();
  const manufacturer = getManufacturerById(selectedManufacturerId, manufacturers);
  const manufacturerLabel = manufacturer?.name ?? "Manufacturer";
  const selectedDevice = getDeviceById(
    selectedDeviceId,
    selectedCategoryId,
    selectedManufacturerId,
    devices,
  );
  const deviceLabel = selectedDevice?.name;
  const workflowStepsAfterDevice = ["Problems", "Parts", "Details"] as const;

  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col bg-white">
      <div className="shrink-0 border-b border-[#E5E7EB] px-4 py-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <nav
          className="flex min-w-0 flex-1 flex-wrap items-center gap-1 text-sm"
          aria-label="Repair workflow"
        >
          {selectedCategory ? (
            <BreadcrumbStep
              label={selectedCategory}
              active={activeStep === "Category"}
              reachable={canNavigateToRepairStep("Category", furthestStep)}
              onClick={() => onStepChange("Category")}
            />
          ) : (
            <BreadcrumbStep
              label="Category"
              active={activeStep === "Category"}
              reachable
              onClick={() => onStepChange("Category")}
            />
          )}

          {selectedManufacturerId && manufacturer ? (
            <>
              <ChevronRight className="size-4 shrink-0 text-[#9CA3AF]" aria-hidden />
              <BreadcrumbStep
                label={manufacturerLabel}
                active={activeStep === "Manufacturer"}
                reachable={canNavigateToRepairStep("Manufacturer", furthestStep)}
                onClick={() => onStepChange("Manufacturer")}
              />
            </>
          ) : null}

          {selectedManufacturerId && !deviceLabel ? (
            <span className="flex items-center gap-1">
              <ChevronRight className="size-4 shrink-0 text-[#9CA3AF]" aria-hidden />
              <BreadcrumbStep
                label="Devices"
                active={activeStep === "Devices"}
                reachable={canNavigateToRepairStep("Devices", furthestStep)}
                onClick={() => onStepChange("Devices")}
              />
            </span>
          ) : null}

          {deviceLabel ? (
            <span className="flex items-center gap-1">
              <ChevronRight className="size-4 shrink-0 text-[#9CA3AF]" aria-hidden />
              <BreadcrumbStep
                label={deviceLabel}
                active={activeStep === "Devices"}
                reachable={canNavigateToRepairStep("Devices", furthestStep)}
                onClick={() => onStepChange("Devices")}
              />
            </span>
          ) : null}

          {workflowStepsAfterDevice.map((step) => (
            <span key={step} className="flex items-center gap-1">
              <ChevronRight className="size-4 shrink-0 text-[#9CA3AF]" aria-hidden />
              <BreadcrumbStep
                label={step}
                active={activeStep === step}
                reachable={canNavigateToRepairStep(step as RepairWorkflowStep, furthestStep)}
                onClick={() => onStepChange(step as RepairStep)}
              />
            </span>
          ))}
        </nav>
        <RepairsSearchBar
          shopId={shopId}
          onSelect={onSearchSelect}
          className="w-full shrink-0 lg:max-w-xl lg:ml-auto"
        />
        </div>
      </div>

      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col overflow-hidden",
          activeStep === "Devices" ||
          activeStep === "Problems" ||
          activeStep === "Parts"
            ? "px-4 py-4 md:px-5"
            : "overflow-y-auto p-4 md:p-5",
        )}
      >
        {activeStep === "Category" ? (
          categoriesLoading ? (
            <div className="flex min-h-[200px] items-center justify-center text-sm text-[#6B7280]">
              Loading categories…
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {categories.map((card) => (
                <CategoryCard
                  key={card.isAdd ? "add" : String(card.dbId ?? card.id)}
                  card={card}
                  onSelect={() => onSelectCategory(card)}
                  onEdit={onEditCategory}
                  onDelete={onDeleteCategory}
                />
              ))}
            </div>
          )
        ) : activeStep === "Manufacturer" ? (
          manufacturersLoading ? (
            <div className="flex min-h-[200px] items-center justify-center text-sm text-[#6B7280]">
              Loading manufacturers…
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5">
              {manufacturers.map((m) => (
                <ManufacturerCard
                  key={m.isAdd ? "add" : String(m.dbId ?? m.id)}
                  manufacturer={m}
                  selected={selectedManufacturerId === m.id}
                  onSelect={() => onSelectManufacturer(m)}
                  onEdit={onEditManufacturer}
                  onDelete={onDeleteManufacturer}
                />
              ))}
            </div>
          )
        ) : activeStep === "Devices" ? (
          <RepairsDevicesStep
            devices={devices}
            categoryId={selectedCategoryId}
            selectedDeviceId={selectedDeviceId}
            devicesLoading={devicesLoading}
            onSelectDevice={onSelectDevice}
            onAddDevice={onAddDevice}
            onEditDevice={onEditDevice}
            onDeleteDevice={onDeleteDevice}
          />
        ) : activeStep === "Problems" ? (
          selectedDeviceId ? (
            <RepairsProblemsStep
              problems={problems}
              problemsLoading={problemsLoading}
              selectedProblemIds={selectedProblemIds}
              onToggleProblem={onToggleProblem}
              onNext={onProblemsNext}
              onAddIssue={onAddIssue}
              onEditIssue={onEditIssue}
              onDeleteIssue={onDeleteIssue}
            />
          ) : (
            <WorkflowPlaceholder
              step="Problems"
              message="Select a device to choose repair problems."
            />
          )
        ) : activeStep === "Parts" ? (
          selectedDeviceId ? (
            <RepairsPartsStep
              parts={parts}
              partsLoading={partsLoading}
              selectedPartIds={selectedPartIds}
              onTogglePart={onTogglePart}
              onNext={onPartsNext}
              onAddPart={onAddPart}
              onEditPart={onEditPart}
              onDeletePart={onDeletePart}
            />
          ) : (
            <WorkflowPlaceholder
              step="Parts"
              message="Select a device to choose repair parts."
            />
          )
        ) : activeStep === "Details" ? (
          selectedDeviceId ? (
            <RepairsDetailsStep
              selectedCategoryLabel={selectedCategory}
              selectedDeviceId={selectedDeviceId}
              initialRepairCharges={initialRepairCharges}
              onConfirm={onConfirmDetails}
              onFormChange={setDetailsForm}
            />
          ) : (
            <WorkflowPlaceholder
              step="Details"
              message="Select a device to enter repair details."
            />
          )
        ) : (
          <WorkflowPlaceholder
            step={activeStep as RepairWorkflowStep}
            excludeSteps={[
              "Manufacturer",
              "Devices",
              "Problems",
              "Parts",
              "Details",
            ]}
          />
        )}
      </div>

      <RepairsWorkflowActions />
    </section>
  );
}

function BreadcrumbStep({
  label,
  active,
  reachable,
  onClick,
}: {
  label: string;
  active: boolean;
  reachable: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!reachable}
      className={cn(
        "rounded px-1.5 py-0.5 font-medium transition-colors",
        active && "text-[var(--repair-primary)]",
        !active && reachable && "text-[#6B7280] hover:text-[#111827]",
        !active && !reachable && "cursor-not-allowed text-[#D1D5DB]",
      )}
    >
      {label}
    </button>
  );
}

function WorkflowPlaceholder({
  step,
  excludeSteps = [],
  message,
}: {
  step: RepairWorkflowStep;
  excludeSteps?: string[];
  message?: string;
}) {
  if (excludeSteps.includes(step)) return null;

  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center rounded-xl border border-dashed border-[#E5E7EB] bg-[#F9FAFB] p-8 text-center">
      <p className="text-sm font-medium text-[#374151]">{step}</p>
      <p className="mt-1 text-xs text-[#6B7280]">
        {message ?? "This step will be available soon."}
      </p>
    </div>
  );
}

function CategoryCard({
  card,
  onSelect,
  onEdit,
  onDelete,
}: {
  card: RepairCategoryCard;
  onSelect: () => void;
  onEdit?: (category: RepairCategoryCard) => void;
  onDelete?: (category: RepairCategoryCard) => void;
}) {
  const Icon = card.icon;
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(card.imageUrl) && !imageFailed;
  const canManage = !card.isAdd && card.dbId != null;

  if (card.isAdd) {
    return (
      <button
        type="button"
        onClick={onSelect}
        className="flex min-h-[118px] flex-col items-center justify-center gap-2 rounded-lg p-4 text-[var(--repair-on-primary)] shadow-md transition-transform hover:scale-[1.02] hover:shadow-lg"
        style={{
          background: `linear-gradient(135deg, var(--repair-primary) 0%, var(--repair-accent-end) 100%)`,
        }}
      >
        <div className="flex size-11 items-center justify-center rounded-full bg-white/20">
          <Plus className="size-7" strokeWidth={2.5} />
        </div>
        <span className="text-sm font-semibold">{card.label}</span>
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
            aria-label={`Actions for ${card.label}`}
          >
            <MoreHorizontal className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            {onEdit ? (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(card);
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
                  onDelete(card);
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
        className="flex min-h-[118px] w-full flex-col items-center justify-center gap-3 rounded-lg border border-[#E5E7EB] bg-white p-4 shadow-sm transition-all hover:border-[var(--repair-primary)] hover:shadow-md"
      >
        {showImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={card.imageUrl}
            alt=""
            className="size-14 rounded-lg object-cover"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <Icon className="size-9 stroke-[1.25] text-[#374151]" />
        )}
        <span className="text-center text-sm font-medium text-[#111827]">{card.label}</span>
      </button>
    </div>
  );
}

function ManufacturerCard({
  manufacturer,
  selected,
  onSelect,
  onEdit,
  onDelete,
}: {
  manufacturer: RepairManufacturer;
  selected: boolean;
  onSelect: () => void;
  onEdit?: (manufacturer: RepairManufacturer) => void;
  onDelete?: (manufacturer: RepairManufacturer) => void;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(manufacturer.imageUrl) && !imageFailed;
  const brandSlug = manufacturer.logoSlug ?? manufacturer.id;
  const canManage = !manufacturer.isAdd && manufacturer.dbId != null;

  if (manufacturer.isAdd) {
    return (
      <button
        type="button"
        onClick={onSelect}
        className="flex min-h-[108px] flex-col items-center justify-center gap-2 rounded-lg p-3 text-[var(--repair-on-primary)] shadow-sm transition-transform hover:scale-[1.01] hover:shadow-md"
        style={{
          background: `linear-gradient(180deg, var(--repair-primary) 0%, var(--repair-accent-end) 100%)`,
        }}
      >
        <div className="flex size-10 items-center justify-center rounded-full bg-white/25">
          <Plus className="size-6" strokeWidth={2.5} />
        </div>
        <span className="text-center text-xs font-semibold leading-tight">
          {manufacturer.name}
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
            aria-label={`Actions for ${manufacturer.name}`}
          >
            <MoreHorizontal className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            {onEdit ? (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(manufacturer);
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
                  onDelete(manufacturer);
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
          "relative flex min-h-[108px] w-full flex-col items-center justify-center gap-2 rounded-lg border bg-white p-3 shadow-sm transition-all",
          "hover:border-[var(--repair-primary)] hover:shadow-md",
          selected
            ? "border-2 border-[var(--repair-primary)] shadow-md ring-1 ring-[var(--repair-primary)]/20"
            : "border-[#E5E7EB]",
        )}
      >
        {showImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={manufacturer.imageUrl}
            alt=""
            className="max-h-12 max-w-[72px] rounded object-contain"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <ManufacturerBrandMark
            name={manufacturer.name}
            logoSlug={brandSlug}
          />
        )}
        <span className="text-center text-xs font-medium text-[#111827]">
          {manufacturer.name}
        </span>
      </button>
    </div>
  );
}
