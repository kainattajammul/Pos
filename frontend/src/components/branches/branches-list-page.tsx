"use client";

import {
  Archive,
  ArchiveRestore,
  Eye,
  Loader2,
  MoreHorizontal,
  Pencil,
  Plus,
  Power,
  Search,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  BranchFormDialog,
  type BranchFormValues,
} from "@/components/branches/branch-form-dialog";
import { BranchPageHeader } from "@/components/branches/branch-page-header";
import { BranchStatCard } from "@/components/branches/branch-ui-primitives";
import { BranchStatusBadge } from "@/components/branches/branch-status-badge";
import { DeleteUserDialog } from "@/components/users/delete-user-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { APP_CONFIG } from "@/constants/config";
import {
  useArchiveBranch,
  useBranches,
  useCreateBranch,
  useDeleteBranch,
  useUpdateBranch,
  useUpdateBranchStatus,
} from "@/hooks/use-branches";
import { fetchBranch } from "@/services/branch.service";
import { getApiErrorMessage } from "@/lib/axios";
import {
  BRANCH_TYPE_LABELS,
  type BranchRecord,
  type BranchStatus,
  type BranchType,
} from "@/lib/branch-types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function BranchesListPage() {
  const shopId = APP_CONFIG.defaultShopId;
  const { data: branches = [], isLoading, isError, error, refetch } = useBranches(shopId);
  const createBranch = useCreateBranch(shopId);
  const updateBranch = useUpdateBranch(shopId);
  const updateStatus = useUpdateBranchStatus(shopId);
  const archiveBranch = useArchiveBranch(shopId);
  const deleteBranch = useDeleteBranch(shopId);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<BranchStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<BranchType | "all">("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<BranchRecord | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<BranchRecord | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return branches.filter((branch) => {
      if (statusFilter !== "all" && branch.status !== statusFilter) return false;
      if (typeFilter !== "all" && branch.type !== typeFilter) return false;
      if (!q) return true;
      return (
        branch.name.toLowerCase().includes(q) ||
        branch.code.toLowerCase().includes(q) ||
        branch.address.city.toLowerCase().includes(q) ||
        branch.contact.email.toLowerCase().includes(q)
      );
    });
  }, [branches, search, statusFilter, typeFilter]);

  const stats = useMemo(
    () => ({
      total: branches.length,
      active: branches.filter((b) => b.status === "active").length,
      inactive: branches.filter((b) => b.status === "inactive").length,
      archived: branches.filter((b) => b.status === "archived").length,
    }),
    [branches],
  );

  const openCreate = () => {
    setEditingBranch(null);
    setDialogOpen(true);
  };

  const openEdit = async (branch: BranchRecord) => {
    setEditLoading(true);
    try {
      const full = await fetchBranch(shopId, branch.uuid);
      setEditingBranch(full);
      setDialogOpen(true);
    } catch {
      toast.error("Could not load branch details for editing.");
    } finally {
      setEditLoading(false);
    }
  };

  const handleFormSubmit = (values: BranchFormValues) => {
    const closeOnSuccess = { onSuccess: () => setDialogOpen(false) };

    if (editingBranch) {
      updateBranch.mutate(
        {
          uuid: editingBranch.uuid,
          payload: {
            name: values.name,
            type: values.type,
            address: {
              line1: values.line1,
              line2: values.line2,
              city: values.city,
              county: values.county,
              postcode: values.postcode,
              country: values.country,
            },
            contact: {
              phone: values.phone,
              email: values.email,
              managerName: values.managerName,
              emergencyContact: editingBranch.contact.emergencyContact,
            },
          },
        },
        closeOnSuccess,
      );
      return;
    }

    createBranch.mutate(
      {
        code: values.code,
        name: values.name,
        type: values.type,
        address: {
          line1: values.line1,
          line2: values.line2,
          city: values.city,
          county: values.county,
          postcode: values.postcode,
          country: values.country,
        },
        contact: {
          phone: values.phone,
          email: values.email,
          managerName: values.managerName,
          emergencyContact: "",
        },
      },
      closeOnSuccess,
    );
  };

  const handleStatus = (branch: BranchRecord, status: BranchStatus) => {
    if (status === "archived") {
      archiveBranch.mutate(branch.uuid);
      return;
    }
    if (branch.status === "archived" && status === "active") {
      updateStatus.mutate({
        uuid: branch.uuid,
        status: "active",
        currentStatus: branch.status,
      });
      return;
    }
    updateStatus.mutate({
      uuid: branch.uuid,
      status,
      currentStatus: branch.status,
    });
  };

  const handleDelete = (branch: BranchRecord) => {
    setDeleteTarget(branch);
  };

  return (
    <div className="mx-auto w-full max-w-[1280px] space-y-4 p-4 md:p-5">
      <BranchPageHeader
        title="Branch Management"
        description="Create, manage, and monitor all store branches from one dashboard."
        actions={
          <Button
            type="button"
            onClick={openCreate}
            className="gap-2 border-0 bg-(--repair-primary) text-(--repair-on-primary) hover:opacity-90"
          >
            <Plus className="size-4" />
            Create branch
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <BranchStatCard label="Total branches" value={stats.total} />
        <BranchStatCard label="Active" value={stats.active} hint="Open for business" />
        <BranchStatCard label="Inactive" value={stats.inactive} hint="Temporarily closed" />
        <BranchStatCard label="Archived" value={stats.archived} hint="Historical records" />
      </div>

      <section className="overflow-hidden rounded-sm border border-[#E5E7EB] bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-[#E5E7EB] px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative min-w-0 flex-1 lg:max-w-md">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, code, city, or email..."
              className="h-10 w-full rounded-md border border-[#E5E7EB] bg-white pr-3 pl-9 text-sm focus:border-(--repair-primary) focus:outline-none focus:ring-1 focus:ring-(--repair-primary)"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as BranchStatus | "all")}
              className="h-10 rounded-md border border-[#E5E7EB] bg-white px-3 text-sm"
            >
              <option value="all">All statuses</option>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="temporarily_closed">Temporarily closed</option>
              <option value="archived">Archived</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as BranchType | "all")}
              className="h-10 rounded-md border border-[#E5E7EB] bg-white px-3 text-sm"
            >
              <option value="all">All types</option>
              {Object.entries(BRANCH_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex min-h-[240px] items-center justify-center">
            <Loader2 className="size-8 animate-spin text-(--repair-primary)" />
          </div>
        ) : isError ? (
          <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 px-4 py-12 text-center">
            <p className="max-w-md text-sm text-[#6B7280]">
              {getApiErrorMessage(
                error,
                "Could not load branches. Check that the backend is running and the database is connected.",
              )}
            </p>
            <Button type="button" variant="outline" size="sm" onClick={() => void refetch()}>
              Retry
            </Button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-4 py-12 text-center text-sm text-[#6B7280]">
            {branches.length === 0
              ? "No branches yet. Click Create branch to add your first one."
              : "No branches match your filters."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-[#FAFAFA] text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                <tr>
                  <th className="px-4 py-3">Branch</th>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Manager</th>
                  <th className="px-4 py-3">Staff</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {filtered.map((branch) => (
                  <tr key={branch.uuid} className="hover:bg-[#FAFAFA]">
                    <td className="px-4 py-3">
                      <Link
                        href={`/branches/${branch.uuid}/setup`}
                        className="font-semibold text-[#111827] hover:text-(--repair-primary)"
                      >
                        {branch.name}
                      </Link>
                      <p className="text-xs text-[#6B7280]">{branch.contact.email}</p>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-[#374151]">{branch.code}</td>
                    <td className="px-4 py-3 text-[#374151]">
                      {BRANCH_TYPE_LABELS[branch.type]}
                    </td>
                    <td className="px-4 py-3 text-[#374151]">
                      {branch.address.city}, {branch.address.postcode}
                    </td>
                    <td className="px-4 py-3 text-[#374151]">{branch.contact.managerName}</td>
                    <td className="px-4 py-3 text-[#374151]">
                      {branch.staff.assignedStaffCount}
                    </td>
                    <td className="px-4 py-3">
                      <BranchStatusBadge status={branch.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <button
                              type="button"
                              className="inline-flex size-8 items-center justify-center rounded-md border border-[#E5E7EB] bg-white text-[#374151] hover:bg-[#F3F4F6]"
                              aria-label={`Actions for ${branch.name}`}
                            />
                          }
                        >
                          <MoreHorizontal className="size-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="scrollbar-hide w-48">
                          <DropdownMenuItem
                            render={<Link href={`/branches/${branch.uuid}/setup`} />}
                          >
                            <Eye className="size-4" />
                            View branch
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => void openEdit(branch)} disabled={editLoading}>
                            <Pencil className="size-4" />
                            Edit profile
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {branch.status !== "active" && branch.status !== "archived" ? (
                            <DropdownMenuItem
                              onClick={() => handleStatus(branch, "active")}
                            >
                              <Power className="size-4" />
                              Activate
                            </DropdownMenuItem>
                          ) : null}
                          {branch.status === "active" ? (
                            <DropdownMenuItem
                              onClick={() => handleStatus(branch, "inactive")}
                            >
                              <Power className="size-4" />
                              Deactivate
                            </DropdownMenuItem>
                          ) : null}
                          {branch.status !== "archived" ? (
                            <DropdownMenuItem
                              onClick={() => handleStatus(branch, "archived")}
                            >
                              <Archive className="size-4" />
                              Archive
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => handleStatus(branch, "active")}
                            >
                              <ArchiveRestore className="size-4" />
                              Restore & activate
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => handleDelete(branch)}
                            disabled={deleteBranch.isPending}
                          >
                            <Trash2 className="size-4" />
                            Delete branch
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {[
          "Branch Setup & Profile",
          "Staff & Permissions",
          "Inventory & Stock",
          "Sales & Operations",
          "Payments & Finance",
        ].map((label) => (
          <div
            key={label}
            className={cn(
              "rounded-sm border border-[#E5E7EB] bg-white px-4 py-3 text-sm font-medium text-[#374151] shadow-sm",
            )}
          >
            {label}
          </div>
        ))}
      </section>

      <BranchFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={editingBranch ? "edit" : "create"}
        branch={editingBranch}
        isSubmitting={createBranch.isPending || updateBranch.isPending}
        onSubmit={handleFormSubmit}
      />

      <DeleteUserDialog
        open={deleteTarget != null}
        onOpenChange={(open) => {
          if (!open && !deleteBranch.isPending) setDeleteTarget(null);
        }}
        entityType="branch"
        itemLabel={
          deleteTarget ? `${deleteTarget.name} (${deleteTarget.code})` : ""
        }
        isPending={deleteBranch.isPending}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteBranch.mutate(deleteTarget.uuid, {
            onSuccess: () => setDeleteTarget(null),
          });
        }}
      />
    </div>
  );
}
