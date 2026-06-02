"use client";

import { Pin } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { TicketActionsDropdown } from "@/components/repairs/manage-tickets/ticket-actions-dropdown";

export interface TicketRow {
  id: string;
  device: string;
  location: string;
  service: string[];
  ticketItems?: string;
  customer: string;
  taskType?: string;
  assignedTo?: string;
  dueAt?: string;
  createdAt: string;
  last?: string;
  draft?: boolean;
  highlighted?: boolean;
}

interface TicketTableProps {
  rows: TicketRow[];
  onTransferTicket?: (row: TicketRow) => void;
  onViewAddComment?: (row: TicketRow) => void;
}

export function TicketTable({
  rows,
  onTransferTicket,
  onViewAddComment,
}: TicketTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-[#E5E7EB] bg-white shadow-sm">
      <Table className="min-w-[1300px]">
        <TableHeader className="bg-white">
          <TableRow className="border-b border-[#E5E7EB] hover:bg-white">
            <TableHead className="w-8 px-3">
              <input type="checkbox" aria-label="Select all tickets" />
            </TableHead>
            <TableHead className="w-8 px-1" />
            <TableHead className="w-16">ID</TableHead>
            <TableHead className="w-44">Device Information</TableHead>
            <TableHead className="w-52">Service</TableHead>
            <TableHead className="w-36">Ticket Items</TableHead>
            <TableHead className="w-40">Customer</TableHead>
            <TableHead className="w-24">Task Type</TableHead>
            <TableHead className="w-36">Assigned To</TableHead>
            <TableHead className="w-40">Due Date &amp; Time</TableHead>
            <TableHead className="w-44">Created Date &amp; Time</TableHead>
            <TableHead className="w-20">Last</TableHead>
            <TableHead className="w-28 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.id}
              className={cn(
                "border-b border-[#E5E7EB] hover:bg-[#FAFAFA]",
                row.highlighted && "bg-[#FFF1F2] hover:bg-[#FFE4E6]",
              )}
            >
              <TableCell className="px-3">
                <input type="checkbox" aria-label={`Select ${row.id}`} />
              </TableCell>
              <TableCell className="px-1 text-[#9CA3AF]">
                <Pin className="size-3.5" />
              </TableCell>
              <TableCell>
                <div className="text-sm font-semibold text-[#374151]">{row.id}</div>
                {row.draft ? (
                  <span className="mt-1 inline-flex rounded-sm bg-[#FEF3C7] px-1.5 py-0.5 text-[11px] font-semibold text-[#92400E]">
                    Draft
                  </span>
                ) : null}
              </TableCell>
              <TableCell className="whitespace-normal">
                {row.device ? (
                  <div className="text-sm font-medium text-[#374151]">{row.device}</div>
                ) : (
                  <span className="text-[#9CA3AF]">---</span>
                )}
                <div className="text-xs text-[#9CA3AF]">Location: {row.location || "---"}</div>
              </TableCell>
              <TableCell className="whitespace-normal">
                {row.service.length > 0 ? (
                  <div className="space-y-0.5 text-sm text-[#4B5563]">
                    {row.service.map((service) => (
                      <div key={service}>{service}</div>
                    ))}
                  </div>
                ) : (
                  <span className="text-[#9CA3AF]">---</span>
                )}
              </TableCell>
              <TableCell className="text-sm text-[#6B7280]">{row.ticketItems ?? ""}</TableCell>
              <TableCell className="text-sm text-[#4B5563]">{row.customer}</TableCell>
              <TableCell className="text-sm text-[#4B5563]">{row.taskType ?? ""}</TableCell>
              <TableCell>
                {row.assignedTo ? (
                  <div className="flex items-center gap-2">
                    <span className="inline-flex size-6 items-center justify-center rounded-full bg-[#E5E7EB] text-[11px] font-semibold text-[#6B7280]">
                      FS
                    </span>
                    <span className="text-sm text-[#4B5563]">{row.assignedTo}</span>
                  </div>
                ) : (
                  <span className="text-[#9CA3AF]">---</span>
                )}
              </TableCell>
              <TableCell className="whitespace-normal text-sm text-[#4B5563]">
                {row.dueAt ?? ""}
              </TableCell>
              <TableCell className="whitespace-normal text-sm text-[#4B5563]">
                {row.createdAt}
              </TableCell>
              <TableCell className="whitespace-normal text-sm text-[#4B5563]">
                {row.last ?? ""}
              </TableCell>
              <TableCell className="text-right">
                <TicketActionsDropdown
                  onTransferTicket={() => onTransferTicket?.(row)}
                  onViewAddComment={() => onViewAddComment?.(row)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
