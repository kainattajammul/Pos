"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface UnlockingAdminHistoryEntry {
  id: string;
  date: string;
  task: string;
  employee: string;
  changeLog: string;
}

interface UnlockingProductAdminHistoryProps {
  rows?: UnlockingAdminHistoryEntry[];
}

const COLUMNS = ["Date", "Task", "Employee", "Change Log"] as const;

export function UnlockingProductAdminHistory({
  rows = [],
}: UnlockingProductAdminHistoryProps) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold text-[#374151]">Admin History</h2>
      <div className="overflow-x-auto rounded-sm border border-[#E5E7EB]">
        <Table className="min-w-[640px]">
          <TableHeader className="bg-pos-table-header">
            <TableRow className="border-b border-[#E5E7EB] hover:bg-pos-table-header">
              {COLUMNS.map((label) => (
                <TableHead
                  key={label}
                  className="whitespace-nowrap px-3 py-2.5 text-xs font-semibold text-pos-muted"
                >
                  {label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow className="hover:bg-pos-surface">
                <TableCell
                  colSpan={COLUMNS.length}
                  className="h-16 px-4 text-center text-sm italic text-[#9CA3AF]"
                >
                  No results found.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="border-b border-[#E5E7EB] hover:bg-pos-surface"
                >
                  <TableCell className="whitespace-nowrap px-3 py-2 text-sm text-[#374151]">
                    {row.date}
                  </TableCell>
                  <TableCell className="px-3 py-2 text-sm text-[#374151]">{row.task}</TableCell>
                  <TableCell className="whitespace-nowrap px-3 py-2 text-sm text-[#374151]">
                    {row.employee}
                  </TableCell>
                  <TableCell className="px-3 py-2 text-sm text-[#374151]">{row.changeLog}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
