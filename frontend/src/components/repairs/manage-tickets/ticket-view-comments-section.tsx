"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, CloudUpload, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { TicketHistoryEntry } from "@/components/repairs/manage-tickets/ticket-history-modal";
import { toast } from "sonner";

const COMMENT_TABS = [
  "All",
  "Private Comments",
  "Diagnostic Notes",
  "Email/SMS",
  "Attachments",
  "Technical Repair Reports",
  "System Messages",
] as const;

type CommentTab = (typeof COMMENT_TABS)[number];

const TO_OPTIONS = ["Select user", "Customer", "Staff", "Technician"] as const;
const VIA_OPTIONS = ["Comments", "Private Comment", "Diagnostic Note", "Email", "SMS"] as const;

interface TicketViewCommentsSectionProps {
  ticketId: string;
  deviceName: string;
  serviceName: string;
  assignee: string;
  systemMessages: TicketHistoryEntry[];
}

export function TicketViewCommentsSection({
  ticketId,
  deviceName,
  serviceName,
  assignee,
  systemMessages,
}: TicketViewCommentsSectionProps) {
  const [activeTab, setActiveTab] = useState<CommentTab>("All");
  const [showSystemMessages, setShowSystemMessages] = useState(true);
  const [to, setTo] = useState("Select user");
  const [via, setVia] = useState("Comments");
  const [subject, setSubject] = useState(`Ticket# ${ticketId}`);
  const [comment, setComment] = useState("");

  const defaultSystemMessage: TicketHistoryEntry = useMemo(
    () => ({
      id: "sys-1",
      userName: "System",
      message: `RepairDesk sent an email New Repair Task [order# ${ticketId}] automatically to Employee ${assignee} for ${deviceName} - ${serviceName}`,
      createdAt: "July 25, 2025 at 1:49 pm",
    }),
    [assignee, deviceName, serviceName, ticketId],
  );

  const feedItems =
    activeTab === "All" || activeTab === "System Messages"
      ? [...systemMessages, defaultSystemMessage]
      : [];

  const handleSave = (flagged: boolean) => {
    if (!comment.trim()) {
      toast.error("Enter a comment before saving");
      return;
    }
    toast.success(flagged ? "Comment saved and flagged" : "Comment saved");
    setComment("");
  };

  return (
    <section className="overflow-hidden rounded-md border border-[#E5E7EB] bg-white shadow-sm">
      <div className="overflow-x-auto border-b border-[#E5E7EB]">
        <div className="flex min-w-max items-center gap-1 px-2 pt-2">
          {COMMENT_TABS.map((tab) => {
            const isActive = tab === activeTab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "whitespace-nowrap px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "border-b-2 border-(--repair-primary) text-(--repair-primary)"
                    : "text-[#6B7280] hover:text-[#374151]",
                )}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3 p-4">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_1fr_1.2fr]">
          <LabeledSelect label="To:" value={to} options={TO_OPTIONS} onChange={setTo} />
          <LabeledSelect label="Via:" value={via} options={VIA_OPTIONS} onChange={setVia} />
          <LabeledInput label="Subject:" value={subject} onChange={setSubject} />
        </div>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Enter comment"
          className="h-24 w-full resize-y rounded-md border border-[#E5E7EB] px-3 py-2 text-sm text-[#111827] outline-none placeholder:text-[#9CA3AF] focus:border-(--repair-primary) focus:ring-1 focus:ring-(--repair-primary)"
        />

        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="flex items-center gap-2 text-sm text-[#4B5563]">
            <input
              type="checkbox"
              checked={showSystemMessages}
              onChange={(e) => setShowSystemMessages(e.target.checked)}
              className="size-4 rounded border-[#D1D5DB]"
            />
            Show System Messages
          </label>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-9 border-[#E5E7EB] px-4 text-sm"
              onClick={() => handleSave(true)}
            >
              Save &amp; Flag
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-9 gap-1.5 border-[#E5E7EB] px-4 text-sm"
              onClick={() => handleSave(false)}
            >
              Save
              <CloudUpload className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      {showSystemMessages && feedItems.length > 0 ? (
        <div className="border-t border-[#E5E7EB]">
          {feedItems.map((item) => (
            <div
              key={item.id}
              className="flex items-start justify-between gap-3 border-b border-[#E5E7EB] px-4 py-3 last:border-b-0"
            >
              <div className="flex min-w-0 items-start gap-3">
                <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-[#EDE9FE] text-[#7C3AED]">
                  <Mail className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#374151]">
                    RepairDesk sent an email to staff for Ticket # {ticketId}
                  </p>
                  <p className="mt-1 text-sm text-[#6B7280]">Email: {item.message}</p>
                  <p className="mt-1 text-xs text-[#9CA3AF]">{item.createdAt}</p>
                </div>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#DCFCE7] px-2 py-0.5 text-xs font-medium text-[#15803D]">
                <CheckCircle2 className="size-3" />
                Not Opened
              </span>
            </div>
          ))}
        </div>
      ) : null}
    </section>
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
    <label className="grid grid-cols-[36px_1fr] items-center gap-2 text-sm text-[#4B5563]">
      <span>{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-full rounded-md border border-[#E5E7EB] bg-white px-2 text-sm text-[#111827] outline-none focus:border-(--repair-primary) focus:ring-1 focus:ring-(--repair-primary)"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
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
        className="h-9 w-full rounded-md border border-[#E5E7EB] bg-white px-2 text-sm text-[#111827] outline-none focus:border-(--repair-primary) focus:ring-1 focus:ring-(--repair-primary)"
      />
    </label>
  );
}
