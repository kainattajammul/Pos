"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { WALKIN_CUSTOMER_NAME } from "@/lib/repairs-customer-data";
import {
  REPAIR_DETAILS_DEFAULTS,
  type RepairDetailsFormValues,
} from "@/lib/repairs-details-data";
import type { CustomerTableRow } from "@/types/customer-table";
import {
  buildRepairTicketSnapshot,
  type RepairTicketSnapshot,
} from "@/lib/repair-ticket-snapshot";
import type { RepairTicketPdfKind } from "@/lib/repair-ticket-pdf";
import type { RepairDevice, RepairManufacturer } from "@/lib/repairs-pos-data";

interface RepairTicketContextValue {
  customerName: string;
  setCustomerName: (name: string) => void;
  selectedCustomer: CustomerTableRow | null;
  selectCustomer: (customer: CustomerTableRow) => void;
  detailsForm: RepairDetailsFormValues;
  setDetailsForm: (values: RepairDetailsFormValues) => void;
  snapshot: RepairTicketSnapshot;
  pdfDialogOpen: boolean;
  pdfKind: RepairTicketPdfKind | null;
  openPdfPreview: (kind: RepairTicketPdfKind) => void;
  closePdfPreview: () => void;
}

const RepairTicketContext = createContext<RepairTicketContextValue | null>(null);

export interface RepairTicketProviderProps {
  children: ReactNode;
  selectedCategoryId: string | null;
  selectedManufacturerId: string | null;
  selectedDeviceId: string | null;
  selectedProblemIds: string[];
  devices?: RepairDevice[];
  manufacturers?: RepairManufacturer[];
}

export function RepairTicketProvider({
  children,
  selectedCategoryId,
  selectedManufacturerId,
  selectedDeviceId,
  selectedProblemIds,
  devices = [],
  manufacturers = [],
}: RepairTicketProviderProps) {
  const [customerName, setCustomerName] = useState(WALKIN_CUSTOMER_NAME);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerTableRow | null>(
    null,
  );
  const [detailsForm, setDetailsForm] =
    useState<RepairDetailsFormValues>(REPAIR_DETAILS_DEFAULTS);

  const selectCustomer = useCallback((customer: CustomerTableRow) => {
    setSelectedCustomer(customer);
    setCustomerName(customer.displayName);
    setDetailsForm((prev) => ({
      ...prev,
      assignedTo: customer.displayName,
    }));
  }, []);
  const [pdfDialogOpen, setPdfDialogOpen] = useState(false);
  const [pdfKind, setPdfKind] = useState<RepairTicketPdfKind | null>(null);

  const snapshot = useMemo(
    () =>
      buildRepairTicketSnapshot({
        customerName,
        selectedCategoryId,
        selectedManufacturerId,
        selectedDeviceId,
        selectedProblemIds,
        detailsForm,
        devices,
        manufacturers,
      }),
    [
      customerName,
      selectedCategoryId,
      selectedManufacturerId,
      selectedDeviceId,
      selectedProblemIds,
      detailsForm,
      devices,
      manufacturers,
    ],
  );

  const openPdfPreview = useCallback((kind: RepairTicketPdfKind) => {
    setPdfKind(kind);
    setPdfDialogOpen(true);
  }, []);

  const closePdfPreview = useCallback(() => {
    setPdfDialogOpen(false);
    setPdfKind(null);
  }, []);

  const value = useMemo(
    () => ({
      customerName,
      setCustomerName,
      selectedCustomer,
      selectCustomer,
      detailsForm,
      setDetailsForm,
      snapshot,
      pdfDialogOpen,
      pdfKind,
      openPdfPreview,
      closePdfPreview,
    }),
    [
      customerName,
      selectedCustomer,
      selectCustomer,
      detailsForm,
      snapshot,
      pdfDialogOpen,
      pdfKind,
      openPdfPreview,
      closePdfPreview,
    ],
  );

  return (
    <RepairTicketContext.Provider value={value}>
      {children}
    </RepairTicketContext.Provider>
  );
}

export function useRepairTicket(): RepairTicketContextValue {
  const ctx = useContext(RepairTicketContext);
  if (!ctx) {
    throw new Error("useRepairTicket must be used within RepairTicketProvider");
  }
  return ctx;
}
