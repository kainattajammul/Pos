"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  ROLE_PERMISSION_GROUPS,
  isGroupFullySelected,
  setGroupPermissions,
  type PermissionGroup,
} from "@/lib/role-permissions";
import { cn } from "@/lib/utils";

interface RolePermissionsPanelProps {
  selected: Record<string, boolean>;
  onChange: (next: Record<string, boolean>) => void;
  disabled?: boolean;
}

function PermissionGroupRow({
  group,
  selected,
  onChange,
  disabled,
}: {
  group: PermissionGroup;
  selected: Record<string, boolean>;
  onChange: (next: Record<string, boolean>) => void;
  disabled?: boolean;
}) {
  const allSelected = isGroupFullySelected(group, selected);

  const toggleAll = (checked: boolean) => {
    onChange(setGroupPermissions(group, checked, selected));
  };

  const toggleOne = (key: string, checked: boolean) => {
    onChange({ ...selected, [key]: checked });
  };

  return (
    <div className="border-b border-neutral-100 last:border-b-0">
      <div className="flex flex-col gap-3 px-4 py-3 md:flex-row md:items-start md:gap-6 md:px-5 md:py-4">
        <div className="flex min-w-[140px] shrink-0 items-center gap-2 md:w-[180px] md:pt-0.5">
          <span className="text-sm font-semibold text-neutral-800">{group.name}</span>
        </div>

        <div className="flex shrink-0 items-center gap-2 md:w-[120px]">
          <Checkbox
            id={`select-all-${group.id}`}
            checked={allSelected}
            onCheckedChange={(v) => toggleAll(Boolean(v))}
            disabled={disabled}
          />
          <Label
            htmlFor={`select-all-${group.id}`}
            className="cursor-pointer text-sm font-normal text-neutral-700"
          >
            Select all
          </Label>
        </div>

        <div className="grid min-w-0 flex-1 grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {group.permissions.map((permission) => (
            <div key={permission.key} className="flex items-center gap-2">
              <Checkbox
                id={permission.key}
                checked={Boolean(selected[permission.key])}
                onCheckedChange={(v) => toggleOne(permission.key, Boolean(v))}
                disabled={disabled}
              />
              <Label
                htmlFor={permission.key}
                className="cursor-pointer text-sm font-normal leading-snug text-neutral-700"
              >
                {permission.label}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function RolePermissionsPanel({
  selected,
  onChange,
  disabled,
}: RolePermissionsPanelProps) {
  return (
    <section className="rounded-lg border border-neutral-200/90 bg-white shadow-sm">
      <div className="border-b border-neutral-100 px-4 py-3 md:px-5">
        <h2 className="text-sm font-semibold text-neutral-800">Permissions</h2>
      </div>
      <div className={cn(disabled && "pointer-events-none opacity-60")}>
        {ROLE_PERMISSION_GROUPS.map((group) => (
          <PermissionGroupRow
            key={group.id}
            group={group}
            selected={selected}
            onChange={onChange}
            disabled={disabled}
          />
        ))}
      </div>
    </section>
  );
}
