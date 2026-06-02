"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ClipboardList,
  MessageCircle,
  Send,
  Upload,
  UserRound,
  Wrench,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { TicketRow } from "@/components/repairs/manage-tickets/ticket-table";

const HISTORY_TABS = [
  { id: "all", label: "All", icon: null },
  { id: "private_comments", label: "Private Comments", icon: MessageCircle },
  { id: "diagnostic_notes", label: "Diagnostic Notes", icon: Wrench },
  { id: "email_sms", label: "Email / SMS Customer", icon: Send },
  { id: "technical_report", label: "Technical Repair Report", icon: ClipboardList },
  { id: "system_messages", label: "System Messages", icon: MessageCircle },
  { id: "upload_attachments", label: "Upload Attachments", icon: Upload },
] as const;

const TO_OPTIONS = ["Select", "Customer", "Staff", "Technician"] as const;
const VIA_OPTIONS = [
  "Comments",
  "Private Comment",
  "Diagnostic Note",
  "Email",
  "SMS",
  "System Message",
] as const;

export interface TicketHistoryEntry {
  id: string;
  message: string;
  createdAt: string;
  userName: string;
}

interface TicketHistoryTabsProps {
  activeTab: (typeof HISTORY_TABS)[number]["id"];
  onTabChange: (tabId: (typeof HISTORY_TABS)[number]["id"]) => void;
}

export function TicketHistoryTabs({ activeTab, onTabChange }: TicketHistoryTabsProps) {
  return (
    <div className="overflow-x-auto border-b border-[#E5E7EB]">
      <div className="flex min-w-max items-center gap-5 px-4 pt-3">
        {HISTORY_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex items-center gap-1.5 border-b-2 pb-3 text-sm font-medium transition-colors",
                isActive
                  ? "border-(--repair-primary) text-(--repair-primary)"
                  : "border-transparent text-[#6B7280] hover:text-[#374151]",
              )}
            >
              {Icon ? <Icon className="size-4" /> : null}
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface TicketCommentFormProps {
  ticketId: string;
  onSave: (payload: {
    to: string;
    via: string;
    subject: string;
    comment: string;
  }) => void;
}

export function TicketCommentForm({ ticketId, onSave }: TicketCommentFormProps) {
  const [to, setTo] = useState("Select");
  const [via, setVia] = useState("Comments");
  const [subject, setSubject] = useState(`Ticket# ${ticketId}`);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSubject(`Ticket# ${ticketId}`);
    setComment("");
    setError(null);
  }, [ticketId]);

  return (
    <div className="space-y-3 p-4">
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[270px_240px_270px]">
        <LabeledSelect label="To:" value={to} onChange={setTo} options={TO_OPTIONS} />
        <LabeledSelect label="Via:" value={via} onChange={setVia} options={VIA_OPTIONS} />
        <LabeledInput label="Subject:" value={subject} onChange={setSubject} />
      </div>
      <textarea
        value={comment}
        onChange={(e) => {
          setComment(e.target.value);
          if (e.target.value.trim()) setError(null);
        }}
        placeholder="Write Comment..."
        className={cn(
          "h-[102px] w-full resize-none rounded-md border border-[#E5E7EB] px-3 py-2 text-sm text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-(--repair-primary) focus:ring-1 focus:ring-(--repair-primary)",
          error && "border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]",
        )}
      />
      <div className="flex justify-end">
        <Button
          type="button"
          onClick={() => {
            if (!comment.trim()) {
              setError("Comment is required");
              return;
            }
            onSave({ to, via, subject, comment: comment.trim() });
            setComment("");
            setError(null);
          }}
          className="h-9 rounded-md border-0 bg-(--repair-primary) px-6 text-sm font-semibold text-(--repair-on-primary) hover:opacity-90"
        >
          Save
          <ClipboardList className="size-4" />
        </Button>
      </div>
      {error ? <p className="-mt-1 text-xs text-[#DC2626]">{error}</p> : null}
    </div>
  );
}

interface TicketHistoryItemProps {
  item: TicketHistoryEntry;
}

export function TicketHistoryItem({ item }: TicketHistoryItemProps) {
  return (
    <div className="flex items-start gap-3 border-t border-[#9EECC6] bg-[#A8F0C8] px-4 py-3 first:border-t-0">
      <span className="inline-flex size-9 items-center justify-center rounded-full bg-[#EAFBF2] text-[#5C6773]">
        <UserRound className="size-4" />
      </span>
      <div>
        <p className="text-sm leading-snug text-[#2F3B44]">
          <span className="font-semibold">{item.userName}</span> {item.message}
        </p>
        <p className="mt-1 text-sm text-[#2F3B44]">{item.createdAt}</p>
      </div>
    </div>
  );
}

interface TicketHistoryListProps {
  items: TicketHistoryEntry[];
  emptyMessage?: string;
}

export function TicketHistoryList({
  items,
  emptyMessage = "No history available for this tab.",
}: TicketHistoryListProps) {
  if (items.length === 0) {
    return (
      <div className="mx-4 mb-4 rounded-md border border-dashed border-[#D1D5DB] bg-[#FAFAFA] px-4 py-6 text-center text-sm text-[#6B7280]">
        {emptyMessage}
      </div>
    );
  }
  return (
    <div className="mb-4 overflow-hidden border-y border-[#9EECC6]">
      {items.map((item) => (
        <TicketHistoryItem key={item.id} item={item} />
      ))}
    </div>
  );
}

function LabeledSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid grid-cols-[28px_1fr] items-center gap-2 text-sm text-[#4B5563]">
      <span>{label}</span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-full appearance-none rounded-md border border-[#E5E7EB] bg-white px-3 pr-8 text-sm text-[#111827] outline-none transition focus:border-(--repair-primary) focus:ring-1 focus:ring-(--repair-primary)"
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]">
          ▼
        </span>
      </div>
    </label>
  );
}

function LabeledInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid grid-cols-[56px_1fr] items-center gap-2 text-sm text-[#4B5563]">
      <span>{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full rounded-md border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none transition focus:border-(--repair-primary) focus:ring-1 focus:ring-(--repair-primary)"
      />
    </label>
  );
}

interface TicketHistoryModalProps {
  open: boolean;
  ticket: TicketRow | null;
  historyItems: TicketHistoryEntry[];
  onOpenChange: (open: boolean) => void;
  onSaveComment: (payload: {
    ticketId: string;
    to: string;
    via: string;
    subject: string;
    comment: string;
  }) => void;
}

export function TicketHistoryModal({
  open,
  ticket,
  historyItems,
  onOpenChange,
  onSaveComment,
}: TicketHistoryModalProps) {
  const [activeTab, setActiveTab] = useState<(typeof HISTORY_TABS)[number]["id"]>("all");

  useEffect(() => {
    if (!open) setActiveTab("all");
  }, [open]);

  const ticketId = ticket?.id ?? "";
  const title = `Ticket History #${ticketId}`;

  const shownItems = useMemo(() => {
    if (activeTab !== "all") return [];
    return historyItems;
  }, [activeTab, historyItems]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-black/25"
        className="h-[90vh] w-[96vw] max-w-[1500px] gap-0 overflow-hidden rounded-sm border border-[#E5E7EB] bg-white p-0 shadow-2xl sm:max-w-[96vw]"
      >
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-4 py-3">
          <DialogTitle className="text-lg font-semibold text-[#374151]">{title}</DialogTitle>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded p-1 text-[#9CA3AF] transition-colors hover:bg-[#F3F4F6] hover:text-[#6B7280]"
            aria-label="Close ticket history dialog"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <TicketHistoryTabs activeTab={activeTab} onTabChange={setActiveTab} />
          <TicketCommentForm
            ticketId={ticketId}
            onSave={({ to, via, subject, comment }) => {
              if (!ticketId) return;
              onSaveComment({ ticketId, to, via, subject, comment });
            }}
          />
          <TicketHistoryList
            items={shownItems}
            emptyMessage="No entries for this section yet."
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
