"use client";

import { Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { BranchPageHeader } from "@/components/branches/branch-page-header";
import { BranchStatusBadge } from "@/components/branches/branch-status-badge";
import {
  BranchFieldGrid,
  BranchSectionCard,
  BranchStatCard,
  branchInputClass,
  branchSelectClass,
  branchTextareaClass,
} from "@/components/branches/branch-ui-primitives";
import { Button } from "@/components/ui/button";
import { useBranch, useUpdateBranch } from "@/hooks/use-branches";
import { getBranchNavItem } from "@/lib/branch-nav-items";
import {
  BRANCH_TYPE_LABELS,
  type BranchRecord,
  type BranchStatus,
  type UpdateBranchPayload,
} from "@/lib/branch-types";

interface BranchSectionPageProps {
  branchId: number;
  sectionSlug: string;
}

export function BranchSectionPage({ branchId, sectionSlug }: BranchSectionPageProps) {
  const navItem = getBranchNavItem(sectionSlug);
  const { data: branch, isLoading } = useBranch(branchId);
  const updateBranch = useUpdateBranch(branch?.shopId ?? 1);
  const [draft, setDraft] = useState<BranchRecord | null>(null);

  useEffect(() => {
    if (branch) setDraft(branch);
  }, [branch]);

  if (isLoading || !branch || !draft || !navItem) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-(--repair-primary)" />
      </div>
    );
  }

  const persist = (payload: UpdateBranchPayload) => {
    void updateBranch.mutateAsync({ id: branchId, payload });
  };

  const handleSaveSection = () => {
    switch (sectionSlug) {
      case "setup":
        persist({
          name: draft.name,
          address: draft.address,
          contact: draft.contact,
          openingHours: draft.openingHours,
        });
        break;
      case "staff":
        persist({ staff: draft.staff });
        break;
      case "inventory":
        persist({ inventory: draft.inventory });
        break;
      case "finance":
        persist({ finance: draft.finance });
        break;
      case "online":
        persist({ online: draft.online });
        break;
      case "communication":
        persist({ communication: draft.communication });
        break;
      case "reporting":
        persist({ reporting: draft.reporting });
        break;
      case "system":
        persist({ system: draft.system });
        break;
      default:
        break;
    }
  };

  const breadcrumbs = [
    { label: "Home", href: "/dashboard" },
    { label: "Branches", href: "/branches" },
    { label: branch.name, href: `/branches/${branchId}/setup` },
    { label: navItem.shortLabel },
  ];

  return (
    <div className="mx-auto w-full max-w-[1100px] space-y-4 p-4 md:p-5">
      <BranchPageHeader
        title={navItem.label}
        description={navItem.description}
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex items-center gap-2">
            <BranchStatusBadge status={branch.status} />
            <Button
              type="button"
              disabled={updateBranch.isPending}
              onClick={handleSaveSection}
              className="gap-2 border-0 bg-(--repair-primary) text-(--repair-on-primary) hover:opacity-90"
            >
              {updateBranch.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              Save section
            </Button>
          </div>
        }
      />

      {sectionSlug === "setup" && (
        <SetupSection branch={draft} onChange={setDraft} onSave={persist} />
      )}
      {sectionSlug === "staff" && (
        <StaffSection branch={draft} onChange={setDraft} onSave={persist} />
      )}
      {sectionSlug === "inventory" && (
        <InventorySection branch={draft} onChange={setDraft} onSave={persist} />
      )}
      {sectionSlug === "operations" && (
        <OperationsSection branch={draft} />
      )}
      {sectionSlug === "finance" && (
        <FinanceSection branch={draft} onChange={setDraft} onSave={persist} />
      )}
      {sectionSlug === "online" && (
        <OnlineSection branch={draft} onChange={setDraft} onSave={persist} />
      )}
      {sectionSlug === "communication" && (
        <CommunicationSection branch={draft} onChange={setDraft} onSave={persist} />
      )}
      {sectionSlug === "reporting" && (
        <ReportingSection branch={draft} onChange={setDraft} onSave={persist} />
      )}
      {sectionSlug === "devices" && (
        <DevicesSection branch={draft} />
      )}
      {sectionSlug === "system" && (
        <SystemSection branch={draft} onChange={setDraft} onSave={persist} />
      )}
    </div>
  );
}

function SetupSection({
  branch,
  onChange,
  onSave,
}: {
  branch: BranchRecord;
  onChange: (b: BranchRecord) => void;
  onSave: (p: UpdateBranchPayload) => void;
}) {
  const days = Object.keys(branch.openingHours) as (keyof typeof branch.openingHours)[];

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-3">
        <BranchStatCard label="Branch code" value={branch.code} />
        <BranchStatCard label="Type" value={BRANCH_TYPE_LABELS[branch.type]} />
        <BranchStatCard label="Status" value={<BranchStatusBadge status={branch.status} />} />
      </div>

      <BranchSectionCard title="Branch profile">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Branch name" value={branch.name} onChange={(v) => onChange({ ...branch, name: v })} />
          <Field label="Manager" value={branch.contact.managerName} onChange={(v) => onChange({ ...branch, contact: { ...branch.contact, managerName: v } })} />
          <Field label="Phone" value={branch.contact.phone} onChange={(v) => onChange({ ...branch, contact: { ...branch.contact, phone: v } })} />
          <Field label="Email" value={branch.contact.email} onChange={(v) => onChange({ ...branch, contact: { ...branch.contact, email: v } })} />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {(["active", "inactive", "archived"] as BranchStatus[]).map((status) => (
            <Button
              key={status}
              type="button"
              variant={branch.status === status ? "default" : "outline"}
              className={branch.status === status ? "border-0 bg-(--repair-primary) text-(--repair-on-primary)" : ""}
              onClick={() => onSave({ status })}
            >
              {status}
            </Button>
          ))}
        </div>
      </BranchSectionCard>

      <BranchSectionCard title="Address">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Line 1" value={branch.address.line1} onChange={(v) => onChange({ ...branch, address: { ...branch.address, line1: v } })} />
          <Field label="Line 2" value={branch.address.line2} onChange={(v) => onChange({ ...branch, address: { ...branch.address, line2: v } })} />
          <Field label="City" value={branch.address.city} onChange={(v) => onChange({ ...branch, address: { ...branch.address, city: v } })} />
          <Field label="Postcode" value={branch.address.postcode} onChange={(v) => onChange({ ...branch, address: { ...branch.address, postcode: v } })} />
        </div>
      </BranchSectionCard>

      <BranchSectionCard title="Opening hours">
        <div className="grid gap-3 sm:grid-cols-2">
          {days.map((day) => (
            <Field
              key={day}
              label={day.charAt(0).toUpperCase() + day.slice(1)}
              value={branch.openingHours[day]}
              onChange={(v) =>
                onChange({
                  ...branch,
                  openingHours: { ...branch.openingHours, [day]: v },
                })
              }
            />
          ))}
        </div>
      </BranchSectionCard>

      <BranchSectionCard title="Holiday / closure settings">
        {branch.holidays.length === 0 ? (
          <p className="text-sm text-[#6B7280]">No holidays configured.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-[#6B7280]">
                <tr>
                  <th className="pb-2">Label</th>
                  <th className="pb-2">Date</th>
                  <th className="pb-2">Closed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {branch.holidays.map((h) => (
                  <tr key={h.id}>
                    <td className="py-2">{h.label}</td>
                    <td className="py-2">{h.date}</td>
                    <td className="py-2">{h.closed ? "Yes" : "No"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </BranchSectionCard>
    </>
  );
}

function StaffSection({
  branch,
  onChange,
  onSave,
}: {
  branch: BranchRecord;
  onChange: (b: BranchRecord) => void;
  onSave: (p: UpdateBranchPayload) => void;
}) {
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-3">
        <BranchStatCard label="Assigned staff" value={branch.staff.assignedStaffCount} />
        <BranchStatCard label="Rota enabled" value={branch.staff.rotaEnabled ? "Yes" : "No"} />
        <BranchStatCard label="Roles" value={branch.staff.rolesEnabled.length} />
      </div>
      <BranchSectionCard title="Staff assignment & permissions">
        <BranchFieldGrid
          fields={[
            { label: "Roles enabled", value: branch.staff.rolesEnabled.join(", ") },
            { label: "Staff schedule / rota", value: branch.staff.rotaEnabled ? "Enabled" : "Disabled" },
            { label: "Security rules", value: branch.staff.securityRules, fullWidth: true },
          ]}
        />
        <div className="mt-4">
          <label className="space-y-1">
            <span className="text-sm font-medium text-[#374151]">Security rules</span>
            <textarea
              value={branch.staff.securityRules}
              onChange={(e) =>
                onChange({ ...branch, staff: { ...branch.staff, securityRules: e.target.value } })
              }
              className={branchTextareaClass}
            />
          </label>
        </div>
        <Button
          type="button"
          className="mt-4 border-0 bg-(--repair-primary) text-(--repair-on-primary)"
          onClick={() => onSave({ staff: branch.staff })}
        >
          Save staff settings
        </Button>
      </BranchSectionCard>
    </>
  );
}

function InventorySection({
  branch,
  onChange,
  onSave,
}: {
  branch: BranchRecord;
  onChange: (b: BranchRecord) => void;
  onSave: (p: UpdateBranchPayload) => void;
}) {
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-4">
        <BranchStatCard label="Stock level" value={branch.inventory.stockLevel.toLocaleString()} />
        <BranchStatCard label="Low stock threshold" value={branch.inventory.lowStockThreshold} />
        <BranchStatCard label="Allocation" value={branch.inventory.allocationMode} />
        <BranchStatCard label="Valuation" value={branch.inventory.valuationMethod} />
      </div>
      <BranchSectionCard title="Inventory allocation & stock">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1">
            <span className="text-sm font-medium text-[#374151]">Allocation mode</span>
            <select
              value={branch.inventory.allocationMode}
              onChange={(e) =>
                onChange({
                  ...branch,
                  inventory: {
                    ...branch.inventory,
                    allocationMode: e.target.value as "shared" | "dedicated",
                  },
                })
              }
              className={branchSelectClass}
            >
              <option value="dedicated">Dedicated</option>
              <option value="shared">Shared</option>
            </select>
          </label>
          <Field
            label="Low stock threshold"
            value={String(branch.inventory.lowStockThreshold)}
            onChange={(v) =>
              onChange({
                ...branch,
                inventory: { ...branch.inventory, lowStockThreshold: Number(v) || 0 },
              })
            }
          />
          <label className="space-y-1 sm:col-span-2">
            <span className="text-sm font-medium text-[#374151]">Reorder rules</span>
            <textarea
              value={branch.inventory.reorderRules}
              onChange={(e) =>
                onChange({
                  ...branch,
                  inventory: { ...branch.inventory, reorderRules: e.target.value },
                })
              }
              className={branchTextareaClass}
            />
          </label>
        </div>
        <Button
          type="button"
          className="mt-4 border-0 bg-(--repair-primary) text-(--repair-on-primary)"
          onClick={() => onSave({ inventory: branch.inventory })}
        >
          Save inventory settings
        </Button>
      </BranchSectionCard>
    </>
  );
}

function OperationsSection({ branch }: { branch: BranchRecord }) {
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <BranchStatCard label="Sales today" value={`£${branch.operations.salesToday.toLocaleString()}`} />
        <BranchStatCard label="Open tickets" value={branch.operations.openRepairTickets} />
        <BranchStatCard label="Appointments/day" value={branch.operations.appointmentSlotsPerDay} />
        <BranchStatCard label="Pickup" value={branch.operations.pickupEnabled ? "On" : "Off"} />
        <BranchStatCard label="Delivery radius" value={`${branch.operations.deliveryRadiusKm} km`} />
        <BranchStatCard label="Warranty claims" value={branch.operations.warrantyClaimsOpen} />
      </div>
      <BranchSectionCard title="Sales, repairs & operations">
        <BranchFieldGrid
          fields={[
            { label: "Repair ticket tracking", value: `${branch.operations.openRepairTickets} open tickets` },
            { label: "Appointment slots", value: `${branch.operations.appointmentSlotsPerDay} per day` },
            { label: "Pickup / collection", value: branch.operations.pickupEnabled ? "Enabled" : "Disabled" },
            { label: "Delivery service area", value: `${branch.operations.deliveryRadiusKm} km radius` },
            { label: "Warranty claims", value: `${branch.operations.warrantyClaimsOpen} open`, fullWidth: true },
          ]}
        />
      </BranchSectionCard>
    </>
  );
}

function FinanceSection({
  branch,
  onChange,
  onSave,
}: {
  branch: BranchRecord;
  onChange: (b: BranchRecord) => void;
  onSave: (p: UpdateBranchPayload) => void;
}) {
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-4">
        <BranchStatCard label="Payments today" value={`£${branch.finance.paymentsToday.toLocaleString()}`} />
        <BranchStatCard label="Refunds today" value={`£${branch.finance.refundsToday.toLocaleString()}`} />
        <BranchStatCard label="Open invoices" value={branch.finance.openInvoices} />
        <BranchStatCard label="Register" value={branch.finance.registerId || "—"} />
      </div>
      <BranchSectionCard title="Payments, register & finance">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Register ID" value={branch.finance.registerId} onChange={(v) => onChange({ ...branch, finance: { ...branch.finance, registerId: v } })} />
          <Field label="VAT rate" value={branch.finance.vatRate} onChange={(v) => onChange({ ...branch, finance: { ...branch.finance, vatRate: v } })} />
          <Field label="Currency" value={branch.finance.currency} onChange={(v) => onChange({ ...branch, finance: { ...branch.finance, currency: v } })} />
          <Field label="Timezone" value={branch.finance.timezone} onChange={(v) => onChange({ ...branch, finance: { ...branch.finance, timezone: v } })} />
        </div>
        <BranchFieldGrid
          fields={[
            { label: "Cash drawer assigned", value: branch.finance.cashDrawerAssigned ? "Yes" : "No" },
            { label: "End-of-day closing", value: branch.finance.endOfDayRequired ? "Required" : "Optional" },
          ]}
        />
        <Button type="button" className="mt-4 border-0 bg-(--repair-primary) text-(--repair-on-primary)" onClick={() => onSave({ finance: branch.finance })}>
          Save finance settings
        </Button>
      </BranchSectionCard>
    </>
  );
}

function OnlineSection({
  branch,
  onChange,
  onSave,
}: {
  branch: BranchRecord;
  onChange: (b: BranchRecord) => void;
  onSave: (p: UpdateBranchPayload) => void;
}) {
  return (
    <BranchSectionCard title="Website, marketplace & online visibility">
      <div className="grid gap-4 sm:grid-cols-2">
        <ToggleRow label="Website visible" checked={branch.online.websiteVisible} onChange={(v) => onChange({ ...branch, online: { ...branch.online, websiteVisible: v } })} />
        <ToggleRow label="Marketplace visible" checked={branch.online.marketplaceVisible} onChange={(v) => onChange({ ...branch, online: { ...branch.online, marketplaceVisible: v } })} />
        <ToggleRow label="Click & collect" checked={branch.online.clickAndCollect} onChange={(v) => onChange({ ...branch, online: { ...branch.online, clickAndCollect: v } })} />
        <Field label="Published products" value={String(branch.online.publishedProducts)} onChange={(v) => onChange({ ...branch, online: { ...branch.online, publishedProducts: Number(v) || 0 } })} />
        <label className="space-y-1 sm:col-span-2">
          <span className="text-sm font-medium text-[#374151]">SEO title</span>
          <input value={branch.online.seoTitle} onChange={(e) => onChange({ ...branch, online: { ...branch.online, seoTitle: e.target.value } })} className={branchInputClass} />
        </label>
      </div>
      <Button type="button" className="mt-4 border-0 bg-(--repair-primary) text-(--repair-on-primary)" onClick={() => onSave({ online: branch.online })}>
        Save online settings
      </Button>
    </BranchSectionCard>
  );
}

function CommunicationSection({
  branch,
  onChange,
  onSave,
}: {
  branch: BranchRecord;
  onChange: (b: BranchRecord) => void;
  onSave: (p: UpdateBranchPayload) => void;
}) {
  return (
    <BranchSectionCard title="Communication & documents">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Email sender" value={branch.communication.emailSender} onChange={(v) => onChange({ ...branch, communication: { ...branch.communication, emailSender: v } })} />
        <Field label="SMS sender" value={branch.communication.smsSender} onChange={(v) => onChange({ ...branch, communication: { ...branch.communication, smsSender: v } })} />
        <Field label="Receipt header" value={branch.communication.receiptHeader} onChange={(v) => onChange({ ...branch, communication: { ...branch.communication, receiptHeader: v } })} />
        <Field label="Receipt footer" value={branch.communication.receiptFooter} onChange={(v) => onChange({ ...branch, communication: { ...branch.communication, receiptFooter: v } })} />
        <label className="space-y-1 sm:col-span-2">
          <span className="text-sm font-medium text-[#374151]">Document template</span>
          <input value={branch.communication.documentTemplate} onChange={(e) => onChange({ ...branch, communication: { ...branch.communication, documentTemplate: e.target.value } })} className={branchInputClass} />
        </label>
        <ToggleRow label="Notifications enabled" checked={branch.communication.notificationsEnabled} onChange={(v) => onChange({ ...branch, communication: { ...branch.communication, notificationsEnabled: v } })} />
      </div>
      <Button type="button" className="mt-4 border-0 bg-(--repair-primary) text-(--repair-on-primary)" onClick={() => onSave({ communication: branch.communication })}>
        Save communication settings
      </Button>
    </BranchSectionCard>
  );
}

function ReportingSection({
  branch,
  onChange,
  onSave,
}: {
  branch: BranchRecord;
  onChange: (b: BranchRecord) => void;
  onSave: (p: UpdateBranchPayload) => void;
}) {
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-3">
        <BranchStatCard label="Sales target / month" value={`£${branch.reporting.salesTargetMonthly.toLocaleString()}`} />
        <BranchStatCard label="Repair target / month" value={branch.reporting.repairTargetMonthly} />
        <BranchStatCard label="Last report" value={branch.reporting.lastReportGenerated === "—" ? "—" : "Recent"} />
      </div>
      <BranchSectionCard title="Reporting & analytics">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Monthly sales target" value={String(branch.reporting.salesTargetMonthly)} onChange={(v) => onChange({ ...branch, reporting: { ...branch.reporting, salesTargetMonthly: Number(v) || 0 } })} />
          <Field label="Monthly repair target" value={String(branch.reporting.repairTargetMonthly)} onChange={(v) => onChange({ ...branch, reporting: { ...branch.reporting, repairTargetMonthly: Number(v) || 0 } })} />
          <label className="space-y-1 sm:col-span-2">
            <span className="text-sm font-medium text-[#374151]">Commission rules</span>
            <textarea value={branch.reporting.commissionRules} onChange={(e) => onChange({ ...branch, reporting: { ...branch.reporting, commissionRules: e.target.value } })} className={branchTextareaClass} />
          </label>
        </div>
        <Button type="button" className="mt-4 border-0 bg-(--repair-primary) text-(--repair-on-primary)" onClick={() => onSave({ reporting: branch.reporting })}>
          Save reporting settings
        </Button>
      </BranchSectionCard>
    </>
  );
}

function DevicesSection({ branch }: { branch: BranchRecord }) {
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-5">
        <BranchStatCard label="Storage locations" value={branch.devices.storageLocations} />
        <BranchStatCard label="Repair shelves" value={branch.devices.repairShelves} />
        <BranchStatCard label="Pickup areas" value={branch.devices.pickupAreas} />
        <BranchStatCard label="In storage" value={branch.devices.devicesInStorage} />
        <BranchStatCard label="Handover pending" value={branch.devices.handoverPending} />
      </div>
      <BranchSectionCard title="Device & storage management">
        <BranchFieldGrid
          fields={[
            { label: "Device storage locations", value: branch.devices.storageLocations },
            { label: "Repair shelf / tray tracking", value: branch.devices.repairShelves },
            { label: "Pickup area tracking", value: branch.devices.pickupAreas },
            { label: "Devices in storage", value: branch.devices.devicesInStorage },
            { label: "Device handover pending", value: branch.devices.handoverPending, fullWidth: true },
          ]}
        />
      </BranchSectionCard>
    </>
  );
}

function SystemSection({
  branch,
  onChange,
  onSave,
}: {
  branch: BranchRecord;
  onChange: (b: BranchRecord) => void;
  onSave: (p: UpdateBranchPayload) => void;
}) {
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-4">
        <BranchStatCard label="Sync status" value={branch.system.dataSyncStatus} />
        <BranchStatCard label="Audit logs" value={branch.system.auditLogCount.toLocaleString()} />
        <BranchStatCard label="Franchise owner" value={branch.system.franchiseOwner} />
        <BranchStatCard label="2FA required" value={branch.system.twoFactorRequired ? "Yes" : "No"} />
      </div>
      <BranchSectionCard title="System & audit">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Franchise ownership" value={branch.system.franchiseOwner} onChange={(v) => onChange({ ...branch, system: { ...branch.system, franchiseOwner: v } })} />
          <Field label="Last sync" value={new Date(branch.system.lastSyncAt).toLocaleString()} onChange={() => {}} disabled />
          <ToggleRow label="Two-factor required" checked={branch.system.twoFactorRequired} onChange={(v) => onChange({ ...branch, system: { ...branch.system, twoFactorRequired: v } })} />
        </div>
        <p className="mt-4 text-sm text-[#6B7280]">
          Activity logs: {branch.system.auditLogCount} entries recorded for this branch.
        </p>
        <Button type="button" className="mt-4 border-0 bg-(--repair-primary) text-(--repair-on-primary)" onClick={() => onSave({ system: branch.system })}>
          Save system settings
        </Button>
      </BranchSectionCard>
    </>
  );
}

function Field({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <label className="space-y-1">
      <span className="text-sm font-medium text-[#374151]">{label}</span>
      <input
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={branchInputClass}
      />
    </label>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between rounded-md border border-[#E5E7EB] px-3 py-2.5">
      <span className="text-sm font-medium text-[#374151]">{label}</span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="size-4 rounded border-[#D1D5DB]" />
    </label>
  );
}
