"use client";

import type { Column, ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { UserTableRow } from "@/types/user-table";

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function SortableHeader({
  column,
  title,
  className,
}: {
  column: Column<UserTableRow, unknown>;
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

export function createUserManagementColumns(handlers: {
  onEdit: (user: UserTableRow) => void;
  onDelete: (user: UserTableRow) => void;
}): ColumnDef<UserTableRow>[] {
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
      accessorKey: "fullName",
      header: ({ column }) => <SortableHeader column={column} title="Full name" />,
      cell: ({ row }) => (
        <span className="block max-w-[160px] truncate font-medium text-neutral-900">
          {row.original.fullName}
        </span>
      ),
    },
    {
      accessorKey: "email",
      header: ({ column }) => <SortableHeader column={column} title="Email" />,
      cell: ({ row }) => (
        <a
          href={`mailto:${row.original.email}`}
          className="block max-w-[200px] truncate text-sm font-medium text-blue-600 underline-offset-2 hover:text-blue-700 hover:underline"
          title={row.original.email}
        >
          {row.original.email}
        </a>
      ),
    },
    {
      accessorKey: "phone",
      header: ({ column }) => <SortableHeader column={column} title="Phone" />,
      cell: ({ row }) => (
        <span className="block max-w-[130px] truncate text-neutral-700">
          {row.original.phone ?? "—"}
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => <SortableHeader column={column} title="Created" />,
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-neutral-700">
          {formatDate(row.original.createdAt)}
        </span>
      ),
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
            aria-label="Edit user"
            onClick={() => onEdit(row.original)}
          >
            <Pencil className="size-3.5" />
          </Button>
          <Button
            type="button"
            size="icon-sm"
            variant="outline"
            className="size-8 border-0 bg-red-500 text-white shadow-sm hover:bg-red-600 hover:text-white"
            aria-label="Delete user"
            onClick={() => onDelete(row.original)}
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      ),
    },
  ];
}
