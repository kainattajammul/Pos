"use client";

import { useState } from "react";
import {
  FileText,
  MoreHorizontal,
  Plus,
  Receipt,
  Shield,
  Ticket,
  Trash2,
} from "lucide-react";
import { ActionToolbar } from "@/components/shared/action-toolbar";
import { RepairsCheckoutDialog } from "@/components/repairs/repairs-checkout-dialog";
import { RepairsEmailCustomerDialog } from "@/components/repairs/repairs-email-customer-dialog";
import { RepairsEstimateDialog } from "@/components/repairs/repairs-estimate-dialog";
import { RepairsRecordsListDialog } from "@/components/repairs/repairs-records-list-dialog";
import { RepairsWarrantyClaimDialog } from "@/components/repairs/repairs-warranty-claim-dialog";
import { RepairsTicketActionsDialog } from "@/components/repairs/repairs-ticket-actions-dialog";
import { RepairsViewPdfDialog } from "@/components/repairs/repairs-view-pdf-dialog";
import { useRepairTicket } from "@/contexts/repair-ticket-context";
import {
  invoiceRecordToSnapshot,
  ticketRecordToSnapshot,
  type RepairInvoiceRecord,
  type RepairTicketRecord,
} from "@/lib/repairs-records-demo-data";
import type { RepairTicketSnapshot } from "@/lib/repair-ticket-snapshot";
import { toast } from "sonner";

export function RepairsWorkflowActions() {
  const [ticketDialogOpen, setTicketDialogOpen] = useState(false);
  const [ticketsListOpen, setTicketsListOpen] = useState(false);
  const [invoicesListOpen, setInvoicesListOpen] = useState(false);
  const [estimateOpen, setEstimateOpen] = useState(false);
  const [warrantyOpen, setWarrantyOpen] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [pdfSnapshot, setPdfSnapshot] = useState<RepairTicketSnapshot | null>(
    null,
  );

  const {
    pdfDialogOpen,
    pdfKind,
    snapshot,
    closePdfPreview,
    openPdfPreview,
    cartLineItems,
    cartTotals,
    ticketConfirmed,
    selectedCustomer,
  } = useRepairTicket();

  const previewSnapshot = pdfSnapshot ?? snapshot;

  const handleViewTicketRecord = (record: RepairTicketRecord) => {
    setPdfSnapshot(ticketRecordToSnapshot(record, snapshot));
    setTicketsListOpen(false);
    openPdfPreview("thermal");
  };

  const handleViewInvoiceRecord = (record: RepairInvoiceRecord) => {
    setPdfSnapshot(invoiceRecordToSnapshot(record, snapshot));
    setInvoicesListOpen(false);
    openPdfPreview("thermal");
  };

  return (
    <>
      <RepairsViewPdfDialog
        open={pdfDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            closePdfPreview();
            setPdfSnapshot(null);
          }
        }}
        kind={pdfKind}
        snapshot={previewSnapshot}
      />
      <RepairsTicketActionsDialog
        open={ticketDialogOpen}
        onOpenChange={setTicketDialogOpen}
        onAction={(actionId) => {
          if (actionId === "email-ticket") {
            setEmailOpen(true);
          }
        }}
      />
      <RepairsRecordsListDialog
        open={ticketsListOpen}
        onOpenChange={setTicketsListOpen}
        variant="tickets"
        currentSnapshot={snapshot}
        onViewTicket={handleViewTicketRecord}
      />
      <RepairsRecordsListDialog
        open={invoicesListOpen}
        onOpenChange={setInvoicesListOpen}
        variant="invoices"
        currentSnapshot={snapshot}
        onViewInvoice={handleViewInvoiceRecord}
      />
      <RepairsEstimateDialog
        open={estimateOpen}
        onOpenChange={setEstimateOpen}
        snapshot={snapshot}
        cartLineItems={cartLineItems}
        cartTotals={cartTotals}
        ticketConfirmed={ticketConfirmed}
      />
      <RepairsWarrantyClaimDialog
        open={warrantyOpen}
        onOpenChange={setWarrantyOpen}
        snapshot={snapshot}
      />
      <RepairsEmailCustomerDialog
        open={emailOpen}
        onOpenChange={setEmailOpen}
        snapshot={snapshot}
        customerEmail={selectedCustomer?.email}
      />
      <RepairsCheckoutDialog
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        snapshot={snapshot}
        cartLineItems={cartLineItems}
        cartTotals={cartTotals}
        ticketConfirmed={ticketConfirmed}
        onComplete={() => {
          setPdfSnapshot(null);
          openPdfPreview("thermal");
        }}
      />

      <ActionToolbar>
        <ActionToolbar.Button
          icon={Ticket}
          label="View Tickets"
          onClick={() => setTicketsListOpen(true)}
        />
        <ActionToolbar.Button
          icon={Receipt}
          label="View Invoices"
          onClick={() => setInvoicesListOpen(true)}
        />
        <ActionToolbar.Button
          icon={FileText}
          label="Create Estimate"
          onClick={() => setEstimateOpen(true)}
        />
        <ActionToolbar.Button
          icon={Plus}
          label="Create Ticket"
          variant="primary"
          onClick={() => setTicketDialogOpen(true)}
        />
        <ActionToolbar.Button
          icon={Shield}
          label="Warranty Claim"
          onClick={() => setWarrantyOpen(true)}
        />
        <ActionToolbar.MenuButton
          icon={MoreHorizontal}
          label="More Actions"
          items={[
            {
              label: "Print label",
              onSelect: () => {
                setPdfSnapshot(null);
                openPdfPreview("label");
              },
            },
            {
              label: "Email customer",
              onSelect: () => setEmailOpen(true),
            },
            {
              label: "Duplicate ticket",
              onSelect: () =>
                toast.message("Duplicate ticket", {
                  description: "Ticket duplication will be available soon.",
                }),
            },
          ]}
        />
        <ActionToolbar.Button
          icon={Trash2}
          label="Cancel"
          variant="destructive"
          onClick={() =>
            toast.message("Cancel sale", {
              description: "This will clear the current repair ticket.",
            })
          }
        />
        <ActionToolbar.Button
          label="Checkout"
          variant="primary"
          onClick={() => setCheckoutOpen(true)}
        />
      </ActionToolbar>
    </>
  );
}
