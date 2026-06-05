"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calculator,
  Camera,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Copy,
  ExternalLink,
  FileText,
  Home,
  ImagePlus,
  Layers,
  Package,
  Pencil,
  Plus,
  Printer,
  Settings2,
  Smartphone,
  Sparkles,
  StickyNote,
  Trash2,
  User,
  Wrench,
  Zap,
} from "lucide-react";
import { RepairsTopNav } from "@/components/repairs/repairs-top-nav";
import { TicketViewCollapsible } from "@/components/repairs/manage-tickets/ticket-view-collapsible";
import { TicketViewCommentsSection } from "@/components/repairs/manage-tickets/ticket-view-comments-section";
import { getTicketDetail } from "@/components/repairs/manage-tickets/ticket-mock-data";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/format";
import { toast } from "sonner";

interface TicketViewPageProps {
  ticketId: string;
}

type ImageTab = "pre" | "post";
type ConditionTab = "pre" | "post";

function SectionAddButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => toast.message(`${label} — coming soon`)}
      className="inline-flex size-7 items-center justify-center rounded bg-(--repair-primary) text-(--repair-on-primary) hover:opacity-90"
      aria-label={label}
    >
      <Plus className="size-4" />
    </button>
  );
}

export function TicketViewPage({ ticketId }: TicketViewPageProps) {
  const router = useRouter();
  const detail = useMemo(() => getTicketDetail(ticketId), [ticketId]);

  const [imageTab, setImageTab] = useState<ImageTab>("pre");
  const [conditionTab, setConditionTab] = useState<ConditionTab>("pre");
  const [rushJob, setRushJob] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    customer: true,
    asset: true,
    billing: true,
    estimate: true,
    assetIssues: true,
    attachedParts: true,
    inventory: true,
    diagnostic: true,
    additionalNote: true,
    additionalDetails: true,
    supplied: true,
    images: true,
    conditions: true,
  });

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (!detail) {
    return (
      <div className="repairs-pos-theme flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-[#F9FAFB]">
        <RepairsTopNav />
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
          <p className="text-lg font-medium text-[#374151]">Ticket {ticketId} not found</p>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/repairs/manage-tickets")}
          >
            Back to Manage Tickets
          </Button>
        </div>
      </div>
    );
  }

  const { row } = detail;
  const serviceLabel = row.service[0] ?? "Repair Service";
  const assigneeInitials = row.assignedTo
    ? row.assignedTo
        .split(" ")
        .map((p) => p[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "—";

  return (
    <div className="repairs-pos-theme flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-[#F9FAFB]">
      <RepairsTopNav />

      <div className="min-h-0 flex-1 overflow-auto p-4 md:p-5">
        <div className="mx-auto w-full max-w-[1600px] space-y-4">
          {/* Header */}
          <header className="space-y-3">
            <nav
              className="flex flex-wrap items-center gap-1 text-sm text-(--repair-primary)"
              aria-label="Breadcrumb"
            >
              <Link href="/dashboard" className="inline-flex items-center hover:underline">
                <Home className="size-3.5" />
              </Link>
              <ChevronRight className="size-3.5 opacity-70" aria-hidden />
              <Link href="/repairs/manage-tickets" className="hover:underline">
                Tickets
              </Link>
            </nav>

            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-[#111827] md:text-3xl">
                    Ticket {row.id}
                  </h1>
                  <button
                    type="button"
                    className="rounded p-1 text-[#9CA3AF] hover:bg-[#F3F4F6]"
                    aria-label="Edit ticket title"
                    onClick={() => toast.message("Edit ticket — coming soon")}
                  >
                    <Pencil className="size-4" />
                  </button>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "h-9 gap-1.5 border-[#E5E7EB] text-sm",
                    rushJob && "border-(--repair-primary) bg-(--repair-primary-light)",
                  )}
                  onClick={() => {
                    setRushJob((v) => !v);
                    toast.success(rushJob ? "Rush job removed" : "Marked as rush job");
                  }}
                >
                  <Sparkles className="size-4" />
                  Mark as Rush Job
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="h-9 gap-1 border-[#E5E7EB] text-sm"
                  onClick={() => toast.message("Print — coming soon")}
                >
                  <Printer className="size-4" />
                  Print
                  <ChevronDown className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-9 gap-1 border-[#E5E7EB] text-sm"
                  onClick={() => toast.message("Checkout — coming soon")}
                >
                  <ExternalLink className="size-4" />
                  Checkout
                </Button>
                <Button
                  type="button"
                  className="h-9 gap-1 border-0 bg-(--repair-primary) text-sm font-semibold text-(--repair-on-primary) hover:opacity-90"
                  onClick={() => toast.message("Create Invoice — coming soon")}
                >
                  Create Invoice
                </Button>
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_340px]">
            {/* Left column */}
            <div className="space-y-3">
              {/* Device summary card */}
              <section className="overflow-hidden rounded-md border border-[#E5E7EB] bg-white shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E5E7EB] px-3 py-2">
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <button
                      type="button"
                      className="font-semibold text-(--repair-primary) hover:underline"
                    >
                      {row.device || "No device"}
                    </button>
                    <span className="text-[#9CA3AF]">|</span>
                    <label className="flex items-center gap-1.5 text-[#6B7280]">
                      <input type="radio" name="serial" className="size-3.5" defaultChecked />
                      No Serial / IMEI
                    </label>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    className="h-8 border-0 bg-(--repair-primary) text-xs text-(--repair-on-primary)"
                    onClick={() => toast.message("Add New — coming soon")}
                  >
                    Add New
                    <ChevronDown className="size-3.5" />
                  </Button>
                </div>

                <div className="flex flex-col gap-3 p-3 sm:flex-row sm:items-start">
                  <div className="flex size-16 shrink-0 items-center justify-center rounded-md border border-[#E5E7EB] bg-[#F9FAFB]">
                    <Smartphone className="size-8 text-[#9CA3AF]" />
                  </div>
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-[#111827]">
                            {row.device || "—"}
                          </span>
                          <Pencil className="size-3.5 text-[#9CA3AF]" />
                        </div>
                        <p className="text-lg font-bold text-(--repair-primary)">
                          {formatCurrency(detail.price)}
                        </p>
                        <p className="text-xs text-[#9CA3AF]">{detail.categoryPath}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#DBEAFE] px-2.5 py-0.5 text-xs font-semibold text-[#1D4ED8]">
                          {detail.status}
                          <ChevronDown className="size-3" />
                        </span>
                        <button type="button" className="rounded p-1 text-[#10A7A8]" aria-label="Copy">
                          <Copy className="size-3.5" />
                        </button>
                        <button type="button" className="rounded p-1 text-[#EF4444]" aria-label="Delete">
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#6B7280]">
                      <span>
                        Assignee:{" "}
                        <strong className="text-[#374151]">
                          [{assigneeInitials}] {row.assignedTo ?? "—"}
                        </strong>
                      </span>
                      <span>
                        Due Date: <strong className="text-[#374151]">{row.dueAt ?? "—"}</strong>
                      </span>
                      <span>
                        Task Type:{" "}
                        <strong className="text-[#374151]">{row.taskType ?? "—"}</strong>
                      </span>
                      <span>Repair Time: —</span>
                    </div>
                  </div>
                </div>
              </section>

              <TicketViewCollapsible
                title="Asset Issues"
                icon={Settings2}
                open={openSections.assetIssues}
                onToggle={() => toggleSection("assetIssues")}
                headerAction={<SectionAddButton label="Add asset issue" />}
              >
                <div className="flex flex-wrap gap-2">
                  {detail.assetIssues.length > 0 ? (
                    detail.assetIssues.map((issue) => (
                      <span
                        key={issue}
                        className="inline-flex items-center gap-1 rounded border border-[#E5E7EB] bg-[#F9FAFB] px-2 py-1 text-xs text-[#374151]"
                      >
                        {issue}
                        <Plus className="size-3 text-(--repair-primary)" />
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-[#9CA3AF]">No asset issues added</p>
                  )}
                </div>
              </TicketViewCollapsible>

              <TicketViewCollapsible
                title="Attached Parts"
                icon={Zap}
                open={openSections.attachedParts}
                onToggle={() => toggleSection("attachedParts")}
                headerAction={<SectionAddButton label="Add attached part" />}
              >
                {detail.attachedParts.length > 0 ? (
                  <ul className="space-y-1 text-sm text-[#374151]">
                    {detail.attachedParts.map((part) => (
                      <li key={part}>{part}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-[#9CA3AF]">No parts attached</p>
                )}
              </TicketViewCollapsible>

              <TicketViewCollapsible
                title="Inventory Items"
                icon={Package}
                open={openSections.inventory}
                onToggle={() => toggleSection("inventory")}
                headerAction={<SectionAddButton label="Add inventory item" />}
              >
                <p className="text-sm text-[#9CA3AF]">No inventory items</p>
              </TicketViewCollapsible>

              <TicketViewCollapsible
                title="Diagnostic Notes"
                icon={Wrench}
                open={openSections.diagnostic}
                onToggle={() => toggleSection("diagnostic")}
                headerAction={<SectionAddButton label="Add diagnostic note" />}
              >
                <p className="text-sm text-[#9CA3AF]">
                  {detail.diagnosticNotes || "No diagnostic notes"}
                </p>
              </TicketViewCollapsible>

              <TicketViewCollapsible
                title="Additional Note"
                icon={StickyNote}
                open={openSections.additionalNote}
                onToggle={() => toggleSection("additionalNote")}
                headerAction={<SectionAddButton label="Add note" />}
              >
                <p className="text-sm text-[#9CA3AF]">
                  {detail.additionalNote || "No additional notes"}
                </p>
              </TicketViewCollapsible>

              <TicketViewCollapsible
                title="Additional Details"
                icon={FileText}
                open={openSections.additionalDetails}
                onToggle={() => toggleSection("additionalDetails")}
                headerAction={
                  <button
                    type="button"
                    onClick={() => toast.message("Edit details — coming soon")}
                    className="inline-flex size-7 items-center justify-center rounded text-(--repair-primary) hover:bg-[#E6FFFB]"
                    aria-label="Edit additional details"
                  >
                    <Pencil className="size-3.5" />
                  </button>
                }
              >
                <p className="text-sm text-[#9CA3AF]">
                  {detail.additionalDetails || "No additional details"}
                </p>
              </TicketViewCollapsible>

              <TicketViewCollapsible
                title="Supplied Items"
                icon={Layers}
                open={openSections.supplied}
                onToggle={() => toggleSection("supplied")}
              >
                <p className="text-sm text-[#9CA3AF]">No supplied items</p>
              </TicketViewCollapsible>

              <TicketViewCollapsible
                title="Pre/Post Repair Images"
                icon={Camera}
                open={openSections.images}
                onToggle={() => toggleSection("images")}
                headerAction={
                  <button
                    type="button"
                    onClick={() => toast.message("Add image — coming soon")}
                    className="inline-flex size-7 items-center justify-center rounded text-(--repair-primary) hover:bg-[#E6FFFB]"
                    aria-label="Add image"
                  >
                    <Camera className="size-3.5" />
                  </button>
                }
              >
                <div className="mb-3 flex gap-4 border-b border-[#E5E7EB]">
                  {(["pre", "post"] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setImageTab(tab)}
                      className={cn(
                        "border-b-2 pb-2 text-sm font-medium capitalize",
                        imageTab === tab
                          ? "border-(--repair-primary) text-(--repair-primary)"
                          : "border-transparent text-[#6B7280]",
                      )}
                    >
                      {tab === "pre" ? "Pre Images" : "Post Images"}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => toast.message("Add image — coming soon")}
                  className="flex size-24 flex-col items-center justify-center gap-1 rounded-md border border-dashed border-[#D1D5DB] bg-[#FAFAFA] text-xs text-[#9CA3AF] hover:border-(--repair-primary) hover:text-(--repair-primary)"
                >
                  <ImagePlus className="size-6" />
                  Add Image
                </button>
              </TicketViewCollapsible>

              <TicketViewCollapsible
                title="Pre/Post Repair Conditions"
                icon={ClipboardList}
                open={openSections.conditions}
                onToggle={() => toggleSection("conditions")}
              >
                <div className="mb-3 flex gap-4 border-b border-[#E5E7EB]">
                  {(["pre", "post"] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setConditionTab(tab)}
                      className={cn(
                        "border-b-2 pb-2 text-sm font-medium",
                        conditionTab === tab
                          ? "border-(--repair-primary) text-(--repair-primary)"
                          : "border-transparent text-[#6B7280]",
                      )}
                    >
                      {tab === "pre" ? "Pre Conditions" : "Post Conditions"}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {detail.conditions.map((label) => (
                    <div
                      key={label}
                      className="flex items-center justify-between rounded border border-[#E5E7EB] bg-[#FAFAFA] px-2 py-1.5 text-xs"
                    >
                      <span className="text-[#374151]">{label}</span>
                      <span className="rounded bg-[#F3F4F6] px-1.5 py-0.5 text-[10px] font-medium text-[#6B7280]">
                        Unchecked
                      </span>
                    </div>
                  ))}
                </div>
              </TicketViewCollapsible>

              <TicketViewCommentsSection
                ticketId={row.id}
                deviceName={row.device}
                serviceName={serviceLabel}
                assignee={row.assignedTo ?? "Staff"}
                systemMessages={detail.systemMessages}
              />
            </div>

            {/* Right column */}
            <div className="space-y-3">
              <TicketViewCollapsible
                title="Customer Information"
                icon={User}
                open={openSections.customer}
                onToggle={() => toggleSection("customer")}
              >
                <p className="mb-2 text-sm font-medium text-[#374151]">{row.customer}</p>
                <div className="flex gap-2">
                  <input
                    type="search"
                    placeholder="Search customer..."
                    className="h-9 min-w-0 flex-1 rounded-md border border-[#E5E7EB] px-2 text-sm outline-none focus:border-(--repair-primary)"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-9 shrink-0 border-[#E5E7EB] text-xs"
                    onClick={() => toast.message("Create customer — coming soon")}
                  >
                    Create New
                  </Button>
                </div>
              </TicketViewCollapsible>

              <TicketViewCollapsible
                title="Customer Asset Information"
                icon={FileText}
                open={openSections.asset}
                onToggle={() => toggleSection("asset")}
              >
                <dl className="space-y-2 text-sm">
                  <InfoRow label="Serial / IMEI" value={detail.serialImei} />
                  <InfoRow label="Warranty" value={detail.warranty} />
                  <InfoRow label="Pin / Pattern" value={detail.pinPattern} />
                  <InfoRow label="Network" value={detail.network || "Select"} isSelect />
                  <InfoRow
                    label="Physical Location"
                    value={detail.physicalLocation || "Select"}
                    isSelect
                  />
                </dl>
              </TicketViewCollapsible>

              <TicketViewCollapsible
                title="Billing"
                icon={Calculator}
                open={openSections.billing}
                onToggle={() => toggleSection("billing")}
              >
                <p className="mb-2 text-xs font-medium text-[#6B7280]">
                  {detail.billing.items.length} Item
                </p>
                {detail.billing.items.map((item) => (
                  <div
                    key={item.label}
                    className="mb-3 rounded border border-[#E5E7EB] bg-[#FAFAFA] p-2 text-sm"
                  >
                    <p className="text-[#374151]">{item.label}</p>
                    <p className="mt-1 font-semibold text-(--repair-primary)">
                      {formatCurrency(item.price)}
                    </p>
                  </div>
                ))}
                <div className="mt-3 space-y-1.5">
                  <BillingPill label="Total" value={detail.billing.total} variant="teal" />
                  <BillingPill label="Paid" value={detail.billing.paid} variant="green" />
                  <BillingPill label="Due" value={detail.billing.due} variant="red" />
                  <BillingPill
                    label="Estimated Profit"
                    value={detail.billing.estimatedProfit}
                    variant="primary"
                  />
                </div>
              </TicketViewCollapsible>

              <section className="overflow-hidden rounded-md border border-[#E5E7EB] bg-white p-3 shadow-sm">
                <h3 className="mb-3 text-sm font-semibold text-[#374151]">Ticket Summary</h3>
                <dl className="space-y-2 text-sm">
                  <InfoRow label="Ticket Number" value={row.id} />
                  <InfoRow label="Created Date" value={detail.ticketSummary.createdAt} />
                  <InfoRow label="Last Modified" value={detail.ticketSummary.lastModified} />
                  <InfoRow label="How did you hear about us?" value="Select" isSelect />
                  <InfoRow label="Location" value={detail.ticketSummary.location} />
                  <div className="flex items-center justify-between gap-2">
                    <dt className="text-[#6B7280]">Generated By</dt>
                    <dd className="flex items-center gap-2 text-[#374151]">
                      <span className="inline-flex size-6 items-center justify-center rounded-full bg-[#E5E7EB] text-[10px] font-semibold">
                        {assigneeInitials}
                      </span>
                      {detail.ticketSummary.generatedBy}
                    </dd>
                  </div>
                  <InfoRow label="Source" value={detail.ticketSummary.source} />
                </dl>
              </section>

              {detail.estimate ? (
                <TicketViewCollapsible
                  title="Estimate"
                  icon={FileText}
                  open={openSections.estimate}
                  onToggle={() => toggleSection("estimate")}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="inline-block rounded bg-[#F3F4F6] px-1.5 py-0.5 text-xs font-semibold text-[#374151]">
                        {detail.estimate.id}
                      </span>
                      <p className="mt-1 text-xs text-[#6B7280]">{detail.estimate.date}</p>
                    </div>
                    <span className="rounded bg-[#22C55E] px-2 py-0.5 text-xs font-semibold text-white">
                      {detail.estimate.status}
                    </span>
                  </div>
                </TicketViewCollapsible>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  isSelect,
}: {
  label: string;
  value: string;
  isSelect?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <dt className="text-[#6B7280]">{label}</dt>
      <dd
        className={cn(
          "text-right",
          isSelect ? "text-[#9CA3AF]" : "text-[#374151]",
        )}
      >
        {value}
      </dd>
    </div>
  );
}

function BillingPill({
  label,
  value,
  variant,
}: {
  label: string;
  value: number;
  variant: "teal" | "green" | "red" | "primary";
}) {
  const styles = {
    teal: "bg-[#CCFBF1] text-[#0F766E]",
    green: "bg-[#DCFCE7] text-[#15803D]",
    red: "bg-[#FEE2E2] text-[#B91C1C]",
    primary: "bg-(--repair-primary) text-(--repair-on-primary)",
  };

  return (
    <div
      className={cn(
        "flex items-center justify-between rounded px-3 py-1.5 text-sm font-semibold",
        styles[variant],
      )}
    >
      <span>{label}</span>
      <span>{formatCurrency(value)}</span>
    </div>
  );
}
