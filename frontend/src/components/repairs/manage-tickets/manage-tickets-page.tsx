"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  ChevronDown,
  Download,
  FileSpreadsheet,
  Filter,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { RepairsTopNav } from "@/components/repairs/repairs-top-nav";
import { DateFilterTabs } from "@/components/repairs/manage-tickets/date-filter-tabs";
import { MOCK_TICKETS } from "@/components/repairs/manage-tickets/ticket-mock-data";
import {
  TicketTable,
  type TicketRow,
} from "@/components/repairs/manage-tickets/ticket-table";
import { TransferTicketModal } from "@/components/repairs/manage-tickets/transfer-ticket-modal";
import {
  TicketHistoryModal,
  type TicketHistoryEntry,
} from "@/components/repairs/manage-tickets/ticket-history-modal";

const MOCK_HISTORY_BY_TICKET: Record<string, TicketHistoryEntry[]> = {
  "T-4": [
    {
      id: "h1",
      userName: "Faisal Sheikh",
      message:
        "changed iPhone 15 - Back Camera Replacement, Battery Replacement Cost Price from 0.00 - 24.00",
      createdAt: "2025-07-24 17:32:43",
    },
    {
      id: "h2",
      userName: "Faisal Sheikh",
      message:
        "added Repair Part front camera for iPhone 15 - Back Camera Replacement, Battery Replacement",
      createdAt: "2025-07-24 17:32:43",
    },
    {
      id: "h3",
      userName: "Faisal Sheikh",
      message:
        "created ticket iPhone 15 - Back Camera Replacement, Battery Replacement",
      createdAt: "2025-07-24 17:32:43",
    },
  ],
  "T-2": [
    {
      id: "h4",
      userName: "Faisal Sheikh",
      message: "created ticket iPhone 15 Pro Max - Back Camera Replacement",
      createdAt: "2025-07-24 13:17:43",
    },
  ],
  "T-1": [
    {
      id: "h5",
      userName: "Faisal Sheikh",
      message: "created ticket iPhone 15 - Back Camera Replacement",
      createdAt: "2025-07-24 12:01:43",
    },
  ],
  "T-3": [],
  "T-5": [
    {
      id: "h6",
      userName: "Faisal Sheikh",
      message:
        "created ticket iPhone 15 Pro Max - Screen (Digitizer + LCD) Replacement",
      createdAt: "2025-07-25 13:49:43",
    },
  ],
};

function ToolbarButton({
  children,
  icon,
  active,
}: {
  children: React.ReactNode;
  icon?: React.ReactNode;
  active?: boolean;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      className={
        active
          ? "h-9 rounded-md border-0 bg-(--repair-primary) px-3 text-sm font-semibold text-(--repair-on-primary) hover:opacity-90"
          : "h-9 rounded-md border-[#E5E7EB] bg-white px-3 text-sm font-medium text-[#374151] hover:bg-[#F9FAFB]"
      }
    >
      {icon}
      {children}
    </Button>
  );
}

export function ManageTicketsPage() {
  const router = useRouter();
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<TicketRow | null>(null);
  const [historyByTicket, setHistoryByTicket] =
    useState<Record<string, TicketHistoryEntry[]>>(MOCK_HISTORY_BY_TICKET);

  const handleViewClick = (row: TicketRow) => {
    router.push(`/repairs/manage-tickets/${encodeURIComponent(row.id)}`);
  };

  const handleTransferClick = (row: TicketRow) => {
    setSelectedTicket(row);
    setTransferModalOpen(true);
  };

  const handleViewAddCommentClick = (row: TicketRow) => {
    setSelectedTicket(row);
    setHistoryModalOpen(true);
  };

  return (
    <div className="repairs-pos-theme flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-[#F9FAFB]">
      <RepairsTopNav />
      <div className="min-h-0 flex-1 overflow-auto p-4 md:p-5">
        <div className="mx-auto w-full max-w-[1600px]">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h1 className="text-3xl font-semibold tracking-tight text-[#111827]">
              Manage Tickets
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              <ToolbarButton icon={<Filter className="size-4" />}>
                Filters
                <ChevronDown className="ml-1 size-3.5" />
              </ToolbarButton>
              <ToolbarButton icon={<CalendarDays className="size-4" />} active>
                Calendar View
              </ToolbarButton>
              <ToolbarButton icon={<RefreshCw className="size-4" />}>Overview</ToolbarButton>
              <ToolbarButton icon={<FileSpreadsheet className="size-4 text-[#2E7D32]" />}>
                Export
              </ToolbarButton>
              <ToolbarButton icon={<Download className="size-4" />} active>
                Create Ticket
              </ToolbarButton>
            </div>
          </div>

          <DateFilterTabs active="7 DAYS" />
          <TicketTable
            rows={MOCK_TICKETS}
            onView={handleViewClick}
            onTransferTicket={handleTransferClick}
            onViewAddComment={handleViewAddCommentClick}
          />
        </div>
      </div>
      <TransferTicketModal
        open={transferModalOpen}
        ticket={selectedTicket}
        onOpenChange={setTransferModalOpen}
      />
      <TicketHistoryModal
        open={historyModalOpen}
        ticket={selectedTicket}
        historyItems={selectedTicket ? (historyByTicket[selectedTicket.id] ?? []) : []}
        onOpenChange={setHistoryModalOpen}
        onSaveComment={({ ticketId, to, via, subject, comment }) => {
          const payload = { ticketId, to, via, subject, comment };
          console.log("ticket-history-comment-payload", payload);
          setHistoryByTicket((prev) => {
            const current = prev[ticketId] ?? [];
            const newItem: TicketHistoryEntry = {
              id: `h-${Date.now()}`,
              userName: "Faisal Sheikh",
              message: `added comment: ${comment}`,
              createdAt: new Date().toISOString().slice(0, 19).replace("T", " "),
            };
            return { ...prev, [ticketId]: [newItem, ...current] };
          });
        }}
      />
    </div>
  );
}
