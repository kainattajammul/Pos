"use client";

import { ArrowLeftRight, ChevronDown } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUsers } from "@/hooks/use-users";
import { readSession, persistSession } from "@/lib/auth-session";
import { cn } from "@/lib/utils";
import { useAppDispatch } from "@/store/hooks";
import { setUser } from "@/store/auth-slice";
import type { AuthUser } from "@/types/api";
import type { UserTableRow } from "@/types/user-table";

interface SwitchUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MOCK_EMPLOYEES: UserTableRow[] = [
  {
    id: 1,
    fullName: "Faisal Sheikh",
    email: "sheikh@fonedoctors.com",
    phone: null,
    accessPin: "1234",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    fullName: "Admin User",
    email: "admin@repairshop.local",
    phone: null,
    accessPin: "0000",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 3,
    fullName: "Repair Staff",
    email: "repair@repairshop.local",
    phone: null,
    accessPin: "4321",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const selectClass =
  "h-10 w-full appearance-none rounded-md border border-[#E5E7EB] bg-white px-3 pr-9 text-sm text-[#111827] outline-none transition focus:border-(--repair-primary) focus:ring-1 focus:ring-(--repair-primary)";

const pinClass =
  "h-10 w-full rounded-md border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-(--repair-primary) focus:ring-1 focus:ring-(--repair-primary)";

export function SwitchUserModal({ open, onOpenChange }: SwitchUserModalProps) {
  const dispatch = useAppDispatch();
  const { data: users = [], isError } = useUsers();
  const [employeeId, setEmployeeId] = useState("");
  const [accessPin, setAccessPin] = useState("");
  const [employeeError, setEmployeeError] = useState<string>();
  const [pinError, setPinError] = useState<string>();

  const employees = useMemo(() => {
    if (users.length > 0) return users;
    if (isError) return MOCK_EMPLOYEES;
    return [];
  }, [users, isError]);

  useEffect(() => {
    if (!open) return;
    setEmployeeId("");
    setAccessPin("");
    setEmployeeError(undefined);
    setPinError(undefined);
  }, [open]);

  const handleClose = () => onOpenChange(false);

  const handleConfirm = () => {
    let hasError = false;

    if (!employeeId) {
      setEmployeeError("Please select an employee");
      hasError = true;
    }

    const pin = accessPin.trim();
    if (!/^\d{4}$/.test(pin)) {
      setPinError("Access PIN must be exactly 4 digits");
      hasError = true;
    }

    if (hasError) return;

    const selected = employees.find((employee) => String(employee.id) === employeeId);
    if (!selected) {
      setEmployeeError("Please select an employee");
      return;
    }

    if (!selected.accessPin || selected.accessPin !== pin) {
      setPinError("Invalid access PIN");
      return;
    }

    const session = readSession();
    const switchedUser: AuthUser = {
      id: String(selected.id),
      email: selected.email,
      name: selected.fullName,
      role: session?.user.role ?? "CASHIER",
    };

    if (session) {
      persistSession({ ...session, user: switchedUser });
    }
    dispatch(setUser(switchedUser));
    toast.success(`Switched to ${selected.fullName}`);
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-black/45"
        className="w-[min(440px,calc(100vw-2rem))] gap-0 overflow-hidden rounded-sm border border-[#D1D5DB] bg-white p-0 shadow-2xl sm:max-w-[440px]"
      >
        <div
          className="relative flex items-center justify-center px-4 py-3.5"
          style={{ backgroundColor: "var(--repair-primary)" }}
        >
          <DialogTitle className="text-lg font-semibold text-white">
            Switch User
          </DialogTitle>
          <button
            type="button"
            onClick={handleClose}
            className="absolute right-4 text-sm font-medium text-white transition-opacity hover:opacity-80"
          >
            Close
          </button>
        </div>

        <div className="space-y-4 px-5 py-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#111827]">Employee Name</label>
            <div className="relative">
              <select
                value={employeeId}
                onChange={(e) => {
                  setEmployeeId(e.target.value);
                  setEmployeeError(undefined);
                }}
                className={cn(
                  selectClass,
                  !employeeId && "text-[#9CA3AF]",
                  employeeError && "border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]",
                )}
              >
                <option value="" disabled>
                  Select Employee
                </option>
                {employees.map((employee) => (
                  <option key={employee.id} value={String(employee.id)}>
                    {employee.fullName}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-[#9CA3AF]" />
            </div>
            {employeeError ? <p className="text-xs text-[#DC2626]">{employeeError}</p> : null}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#111827]">Access PIN</label>
            <input
              type="password"
              inputMode="numeric"
              autoComplete="off"
              maxLength={4}
              value={accessPin}
              onChange={(e) => {
                setAccessPin(e.target.value.replace(/\D/g, "").slice(0, 4));
                setPinError(undefined);
              }}
              placeholder="****"
              className={cn(
                pinClass,
                pinError && "border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]",
              )}
            />
            {pinError ? <p className="text-xs text-[#DC2626]">{pinError}</p> : null}
          </div>
        </div>

        <div className="flex justify-end border-t border-[#E5E7EB] bg-[#F3F4F6] px-5 py-3">
          <button
            type="button"
            onClick={handleConfirm}
            className="inline-flex h-10 items-center gap-2 rounded-sm border-0 px-5 text-sm font-semibold text-(--repair-on-primary) transition-opacity hover:opacity-90"
            style={{ backgroundColor: "var(--repair-primary)" }}
          >
            <ArrowLeftRight className="size-4" />
            Confirm
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
