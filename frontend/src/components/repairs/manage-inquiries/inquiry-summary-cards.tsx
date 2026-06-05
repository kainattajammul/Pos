"use client";

import type { ComponentType } from "react";
import {
  BarChart3,
  FileCheck2,
  FilePenLine,
  FileX2,
  FolderOpen,
  ScrollText,
} from "lucide-react";
import { formatCurrency } from "@/utils/format";

interface SummaryCard {
  id: string;
  title: string;
  value: string;
  subtitle?: string;
  icon: ComponentType<{ className?: string }>;
  iconColor: string;
}

interface InquirySummaryCardsProps {
  newInquiries: number;
  openInquiries: number;
  closedInquiries: number;
  cancelledInquiries: number;
  totalValueCreated: number;
  totalValueClosed: number;
}

export function InquirySummaryCards({
  newInquiries,
  openInquiries,
  closedInquiries,
  cancelledInquiries,
  totalValueCreated,
  totalValueClosed,
}: InquirySummaryCardsProps) {
  const cards: SummaryCard[] = [
    {
      id: "new",
      title: "New Inquiries",
      value: String(newInquiries),
      icon: FilePenLine,
      iconColor: "text-[#1C9BD9]",
    },
    {
      id: "open",
      title: "Open Inquiries",
      value: String(openInquiries),
      icon: FolderOpen,
      iconColor: "text-[#31C3B1]",
    },
    {
      id: "closed",
      title: "Closed Inquiries",
      value: String(closedInquiries),
      icon: FileCheck2,
      iconColor: "text-[#8B7DD8]",
    },
    {
      id: "cancelled",
      title: "Cancelled Inquiries",
      value: String(cancelledInquiries),
      icon: FileX2,
      iconColor: "text-[#EF5DA8]",
    },
    {
      id: "createdValue",
      title: "Total Value of All Inquiries",
      subtitle: "Inquiries Created (0)",
      value: formatCurrency(totalValueCreated),
      icon: BarChart3,
      iconColor: "text-[#3AAE5A]",
    },
    {
      id: "closedValue",
      title: "Inquiries Closed",
      subtitle: "Inquiries Closed (0)",
      value: formatCurrency(totalValueClosed),
      icon: ScrollText,
      iconColor: "text-[#1C9BD9]",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <article
            key={card.id}
            className="flex min-h-[148px] flex-col items-center justify-between rounded-sm border border-[#E5E7EB] bg-white px-3 py-4 text-center"
          >
            <Icon className={`size-6 ${card.iconColor}`} />
            <div>
              <p className="text-sm font-medium text-[#374151]">{card.title}</p>
              {card.subtitle ? (
                <p className="text-xs text-[#6B7280]">{card.subtitle}</p>
              ) : null}
            </div>
            <p className="text-[36px] font-semibold leading-none text-[#111827]">{card.value}</p>
          </article>
        );
      })}
    </div>
  );
}
