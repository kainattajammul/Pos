"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { RolePermissionsPanel } from "@/components/roles/role-permissions-panel";
import { useCreateRole, useRole, useRoles, useUpdateRole } from "@/hooks/use-roles";
import { createEmptyPermissionState } from "@/lib/role-permissions";
import { loadRoleProfile, saveRoleProfile } from "@/lib/role-form-storage";
import { cn } from "@/lib/utils";

export type RoleFormMode = "add" | "edit";

interface RoleFormProps {
  mode: RoleFormMode;
  roleId?: number;
}

const inputClass = "h-9 max-w-xl border-neutral-200 bg-white text-sm shadow-none";

export function RoleForm({ mode, roleId }: RoleFormProps) {
  const isEdit = mode === "edit";
  const router = useRouter();
  const createMutation = useCreateRole();
  const updateMutation = useUpdateRole();
  const { data: roles = [] } = useRoles();
  const {
    data: role,
    isPending: rolePending,
    isFetching: roleFetching,
    isError: roleError,
    isFetched: roleFetched,
  } = useRole(roleId ?? 0);

  const [roleName, setRoleName] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [permissions, setPermissions] = useState(createEmptyPermissionState);
  const [hydrated, setHydrated] = useState(!isEdit);

  const defaultShopId = roles[0]?.shopId ?? 1;
  const roleLoading = isEdit && (rolePending || (roleFetching && !role));

  useEffect(() => {
    if (!isEdit || !role) return;
    const stored = loadRoleProfile(role.id);
    setRoleName(role.roleName);
    setPermissions(stored?.permissions ?? createEmptyPermissionState());
    setHydrated(true);
  }, [isEdit, role]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = roleName.trim();
    if (trimmed.length < 2) {
      setNameError("Role name must be at least 2 characters");
      return;
    }
    setNameError(null);

    if (isEdit && roleId) {
      updateMutation.mutate(
        { id: roleId, payload: { name: trimmed } },
        {
          onSuccess: () => {
            saveRoleProfile(roleId, permissions);
            router.push("/roles");
          },
        },
      );
      return;
    }

    createMutation.mutate(
      { shopId: defaultShopId, name: trimmed },
      {
        onSuccess: (data) => {
          saveRoleProfile(data.id, permissions);
          router.push("/roles");
        },
      },
    );
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  if (roleLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 max-w-xl w-full" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  if (isEdit && roleFetched && !roleLoading && (roleError || !role)) {
    return (
      <div className="rounded-lg border border-dashed border-neutral-200 bg-white p-8 text-center">
        <p className="text-sm text-neutral-600">Role not found.</p>
        <Button type="button" variant="outline" className="mt-4" onClick={() => router.push("/roles")}>
          Back to roles
        </Button>
      </div>
    );
  }

  if (isEdit && !hydrated) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 max-w-xl w-full" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  return (
    <>
      <form
        id={isEdit ? "edit-role-form" : "add-role-form"}
        onSubmit={handleSubmit}
        className="space-y-4"
        noValidate
      >
        <section className="rounded-lg border border-neutral-200/90 bg-white px-4 py-4 shadow-sm md:px-5 md:py-5">
          <div className="space-y-1.5">
            <Label htmlFor="role-name" className="text-xs font-medium text-neutral-700">
              Role name <span className="text-primary">*</span>
            </Label>
            <Input
              id="role-name"
              value={roleName}
              onChange={(e) => {
                setRoleName(e.target.value);
                if (nameError) setNameError(null);
              }}
              placeholder="e.g. Manager"
              className={inputClass}
              disabled={isSubmitting}
            />
            {nameError ? <p className="text-xs text-destructive">{nameError}</p> : null}
          </div>
        </section>

        <RolePermissionsPanel
          selected={permissions}
          onChange={setPermissions}
          disabled={isSubmitting}
        />
      </form>

      <div className="sticky bottom-0 z-10 -mx-4 mt-6 border-t border-neutral-200/90 bg-[#f4f6f9]/95 px-4 py-3 backdrop-blur-sm md:-mx-6 md:px-6 lg:-mx-8 lg:px-8">
        <div className="mx-auto flex max-w-[1600px] items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-9 border-neutral-200 bg-white"
            disabled={isSubmitting}
            onClick={() => router.push("/roles")}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form={isEdit ? "edit-role-form" : "add-role-form"}
            disabled={isSubmitting}
            className={cn(
              "h-9 min-w-[120px] border-0 bg-primary font-semibold text-primary-foreground shadow-sm hover:bg-primary/90",
            )}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                {isEdit ? "Updating…" : "Saving…"}
              </>
            ) : isEdit ? (
              "Update"
            ) : (
              "Save"
            )}
          </Button>
        </div>
      </div>
    </>
  );
}
