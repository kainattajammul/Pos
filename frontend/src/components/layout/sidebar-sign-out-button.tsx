"use client";

import { LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SidebarSignOutButtonProps {
  collapsed?: boolean;
}

export function SidebarSignOutButton({ collapsed }: SidebarSignOutButtonProps) {
  const { signOut, isLoggingOut } = useAuth();

  return (
    <Button
      type="button"
      variant="ghost"
      disabled={isLoggingOut}
      onClick={() => void signOut()}
      title="Sign out"
      aria-label={isLoggingOut ? "Signing out" : "Sign out"}
      className={cn(
        "w-full gap-2 border-0 bg-primary font-medium text-primary-foreground shadow-sm transition-colors",
        "hover:bg-primary/90 hover:text-primary-foreground focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-60",
        collapsed ? "size-9 shrink-0 p-0" : "h-9 px-3 text-sm",
      )}
    >
      <LogOut className="size-4 shrink-0" aria-hidden />
      {!collapsed ? (
        <span>{isLoggingOut ? "Signing out…" : "Sign out"}</span>
      ) : null}
    </Button>
  );
}
