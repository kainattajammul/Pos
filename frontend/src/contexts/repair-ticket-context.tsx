"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { WALKIN_CUSTOMER_NAME } from "@/lib/repairs-customer-data";
import {
  buildRepairCartLineItems,
  computeRepairCartTotals,
  type RepairCartLineItem,
  type RepairCartTotals,
} from "@/lib/repair-cart";
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
import type { RepairProblem } from "@/lib/repairs-problems-data";
import type { RepairPart } from "@/lib/repairs-parts-data";
import type { RepairDevice, RepairManufacturer } from "@/lib/repairs-pos-data";

interface RepairTicketContextValue {
  customerName: string;
  setCustomerName: (name: string) => void;
  selectedCustomer: CustomerTableRow | null;
  selectCustomer: (customer: CustomerTableRow) => void;
  detailsForm: RepairDetailsFormValues;
  setDetailsForm: (values: RepairDetailsFormValues) => void;
  snapshot: RepairTicketSnapshot;
  selectedCategoryLabel: string | null;
  ticketConfirmed: boolean;
  cartLineItems: RepairCartLineItem[];
  cartTotals: RepairCartTotals;
  confirmTicket: (values: RepairDetailsFormValues) => void;
  pdfDialogOpen: boolean;
  pdfKind: RepairTicketPdfKind | null;
  openPdfPreview: (kind: RepairTicketPdfKind) => void;
  closePdfPreview: () => void;
}

const RepairTicketContext = createContext<RepairTicketContextValue | null>(null);

export interface RepairTicketProviderProps {
  children: ReactNode;
  selectedCategoryId: string | null;
  selectedCategoryLabel: string | null;
  selectedManufacturerId: string | null;
  selectedDeviceId: string | null;
  selectedProblemIds: string[];
  selectedPartIds: string[];
  devices?: RepairDevice[];
  manufacturers?: RepairManufacturer[];
  problems?: RepairProblem[];
  parts?: RepairPart[];
}

export function RepairTicketProvider({
  children,
  selectedCategoryId,
  selectedCategoryLabel,
  selectedManufacturerId,
  selectedDeviceId,
  selectedProblemIds,
  selectedPartIds,
  devices = [],
  manufacturers = [],
  problems = [],
  parts = [],
}: RepairTicketProviderProps) {
  const [customerName, setCustomerName] = useState(WALKIN_CUSTOMER_NAME);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerTableRow | null>(
    null,
  );
  const [detailsForm, setDetailsForm] =
    useState<RepairDetailsFormValues>(REPAIR_DETAILS_DEFAULTS);
  const [ticketConfirmed, setTicketConfirmed] = useState(false);
  const [cartLineItems, setCartLineItems] = useState<RepairCartLineItem[]>([]);

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

  const selectionKey = useMemo(
    () =>
      [
        selectedCategoryId,
        selectedManufacturerId,
        selectedDeviceId,
        selectedProblemIds.join(","),
        selectedPartIds.join(","),
      ].join("|"),
    [
      selectedCategoryId,
      selectedManufacturerId,
      selectedDeviceId,
      selectedProblemIds,
      selectedPartIds,
    ],
  );

  useEffect(() => {
    setTicketConfirmed(false);
    setCartLineItems([]);
  }, [selectionKey]);

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
        problems,
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
      problems,
    ],
  );

  const cartTotals = useMemo(
    () => computeRepairCartTotals(cartLineItems, detailsForm),
    [cartLineItems, detailsForm],
  );

  const confirmTicket = useCallback(
    (values: RepairDetailsFormValues) => {
      setDetailsForm(values);
      const lines = buildRepairCartLineItems({
        selectedProblemIds,
        selectedPartIds,
        problems,
        parts,
        repairCharges: values.repairCharges,
      });
      setCartLineItems(lines);
      setTicketConfirmed(true);
    },
    [selectedProblemIds, selectedPartIds, problems, parts],
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
      selectedCategoryLabel,
      ticketConfirmed,
      cartLineItems,
      cartTotals,
      confirmTicket,
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
      selectedCategoryLabel,
      ticketConfirmed,
      cartLineItems,
      cartTotals,
      confirmTicket,
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
