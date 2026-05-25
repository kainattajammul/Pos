"use client";

import type { Column, ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { RoleTableRow } from "@/types/role-table";

function statusBadgeClass(status: string) {
  const s = status.toLowerCase();
  if (s === "active") {
    return "border-emerald-200/80 bg-emerald-50 text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-200";
  }
  if (s === "inactive") {
    return "border-neutral-200 bg-neutral-100 text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200";
  }
  return "border-amber-200/80 bg-amber-50 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/50 dark:text-amber-100";
}

function SortableHeader({
  column,
  title,
  className,
}: {
  column: Column<RoleTableRow, unknown>;
  title: string;
  className?: string;
}) {
  const sorted = column.getIsSorted();
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center gap-1.5 text-left font-semibold tracking-tight text-neutral-800 transition hover:text-neutral-950",
        column.getCanSort() && "cursor-pointer select-none",
        className,
      )}
      onClick={column.getToggleSortingHandler()}
      disabled={!column.getCanSort()}
    >
      {title}
      {column.getCanSort() ? (
        <ArrowUpDown
          className={cn(
            "size-3.5 shrink-0 text-neutral-400",
            sorted === "asc" && "text-neutral-700",
            sorted === "desc" && "text-neutral-700",
          )}
        />
      ) : null}
    </button>
  );
}

export function createRoleManagementColumns(handlers: {
  onEdit: (role: RoleTableRow) => void;
  onDelete: (role: RoleTableRow) => void;
}): ColumnDef<RoleTableRow>[] {
  const { onEdit, onDelete } = handlers;

  return [
    {
      id: "sr",
      header: "SR.",
      enableSorting: false,
      cell: ({ table, row }) => {
        const { pageIndex, pageSize } = table.getState().pagination;
        const n = pageIndex * pageSize + row.index + 1;
        return (
          <span className="tabular-nums text-neutral-500">
            {String(n).padStart(2, "0")}
          </span>
        );
      },
    },
    {
      accessorKey: "id",
      header: ({ column }) => <SortableHeader column={column} title="Role Id" />,
      cell: ({ row }) => (
        <span className="tabular-nums font-mono text-xs text-neutral-700">
          {row.original.id}
        </span>
      ),
    }
    ,
    {
      accessorKey: "roleName",
      header: ({ column }) => <SortableHeader column={column} title="Role name" />,
      cell: ({ row }) => (
        <span className="block max-w-[180px] truncate font-semibold tracking-wide text-neutral-900 uppercase">
          {row.original.roleName}
        </span>
      ),
    },
    {
      accessorKey: "shopId",
      header: ({ column }) => <SortableHeader column={column} title="Shop ID" />,
      sortingFn: (a, b, id) => {
        const av = a.getValue(id) as number | null;
        const bv = b.getValue(id) as number | null;
        const an = av ?? -1;
        const bn = bv ?? -1;
        return an === bn ? 0 : an > bn ? 1 : -1;
      },
      cell: ({ row }) => (
        <span className="tabular-nums font-medium text-neutral-800">
          {row.original.shopId ?? "—"}
        </span>
      ),
    },
    {
      accessorKey: "description",
      header: "Description",
      enableSorting: false,
      cell: ({ row }) => (
        <span
          className="block max-w-[240px] truncate text-sm text-neutral-600"
          title={row.original.description ?? undefined}
        >
          {row.original.description ?? "—"}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => <SortableHeader column={column} title="Status" />,
      cell: ({ row }) => {
        const s = row.original.status;
        return (
          <Badge
            variant="outline"
            className={cn(
              "rounded-md px-2.5 py-0.5 text-xs font-medium capitalize",
              statusBadgeClass(s),
            )}
          >
            {s}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: () => <span className="text-neutral-800">Actions</span>,
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            size="icon-sm"
            variant="outline"
            className="size-8 border-0 bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
            aria-label="Edit role"
            onClick={() => onEdit(row.original)}
          >
            <Pencil className="size-3.5" />
          </Button>
          <Button
            type="button"
            size="icon-sm"
            variant="outline"
            className="size-8 border-0 bg-red-500 text-white shadow-sm hover:bg-red-600 hover:text-white"
            aria-label="Delete role"
            onClick={() => onDelete(row.original)}
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      ),
    },
  ];
}
