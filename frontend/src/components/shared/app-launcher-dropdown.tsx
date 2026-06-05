"use client";

import {
  ArrowLeftRight,
  Grid3X3,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { APP_LAUNCHER_COLUMNS } from "@/lib/app-launcher-menu";
import { cn } from "@/lib/utils";

interface AppLauncherDropdownProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PLACEHOLDER_USER = {
  name: "Faisal Sheikh",
  email: "sheikh@fonedoctors.com",
};

function LauncherMenuItem({
  href,
  label,
  icon: Icon,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className="flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-medium text-[#374151] transition-colors hover:bg-[#F3F4F6]"
    >
      <Icon className="size-[18px] shrink-0 text-(--repair-primary)" aria-hidden />
      <span>{label}</span>
    </Link>
  );
}

export function AppLauncherDropdown({ open, onOpenChange }: AppLauncherDropdownProps) {
  const router = useRouter();
  const { user, logout, isLoggingOut } = useAuth();

  const displayName = user?.name?.trim() || PLACEHOLDER_USER.name;
  const displayEmail = user?.email ?? PLACEHOLDER_USER.email;
  const avatarInitials = displayName
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const close = () => onOpenChange(false);

  const handleSwitchUser = () => {
    close();
    toast.message("Switch user — connect user picker when ready");
    router.push("/login?switch=1");
  };

  const handleLogout = () => {
    close();
    logout();
  };

  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className={cn(
              "rounded p-1.5 transition-colors",
              open
                ? "bg-white/20 text-white"
                : "text-white/90 hover:bg-white/10",
            )}
            aria-label="App launcher"
            aria-expanded={open}
          />
        }
      >
        <Grid3X3 className="size-5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className={cn(
          "z-60 w-[min(720px,calc(100vw-1rem))] overflow-hidden rounded-lg border border-[#E5E7EB] bg-white p-0",
          "shadow-[0_14px_32px_rgba(15,23,42,0.18)]",
          "animate-in fade-in-0 zoom-in-95 duration-150",
        )}
      >
        <div className="grid grid-cols-1 gap-1 p-3 sm:grid-cols-2 lg:grid-cols-3">
          {APP_LAUNCHER_COLUMNS.map((column, columnIndex) => (
            <div key={columnIndex} className="flex min-w-0 flex-col gap-0.5">
              {column.map((item) => (
                <LauncherMenuItem
                  key={item.id}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  onNavigate={close}
                />
              ))}
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 border-t border-[#E5E7EB] bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#E5E7EB] text-sm font-semibold text-[#6B7280]"
              aria-hidden
            >
              {avatarInitials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[#111827]">
                {displayName}
              </p>
              <p className="truncate text-xs text-[#6B7280]">{displayEmail}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:justify-end">
            <button
              type="button"
              onClick={handleSwitchUser}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-(--repair-primary) transition-opacity hover:opacity-80"
            >
              <ArrowLeftRight className="size-4" />
              Switch User
            </button>
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#DC2626] transition-opacity hover:opacity-80 disabled:opacity-50"
            >
              <LogOut className="size-4" />
              Log Out
            </button>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
