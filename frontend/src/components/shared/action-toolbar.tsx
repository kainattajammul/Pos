"use client";

import * as React from "react";
import type { LucideIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const PRIMARY_NAVY = "#1f2a44";
const CANCEL_BG = "#fff1f2";
const CANCEL_FG = "#b91c1c";

export type ActionToolbarVariant = "default" | "primary" | "destructive";

const variantStyles: Record<ActionToolbarVariant, string> = {
  default: cn(
    "border-zinc-200/90 bg-white text-zinc-800 shadow-sm",
    "hover:border-zinc-300 hover:bg-zinc-50 hover:shadow-md",
    "active:bg-zinc-100",
  ),
  primary: cn(
    "border-transparent text-white shadow-sm",
    "hover:brightness-110 active:brightness-95",
  ),
  destructive: cn(
    "border-red-100 shadow-sm",
    "hover:brightness-[0.98] active:brightness-95",
  ),
};

export interface ActionToolbarMenuItem {
  label: string;
  icon?: LucideIcon;
  onSelect?: () => void;
  disabled?: boolean;
}

export interface ActionToolbarButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  icon?: LucideIcon;
  variant?: ActionToolbarVariant;
}

function ActionToolbarRoot({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "shrink-0 border-t border-zinc-200/90 bg-zinc-50/90 px-4 py-3.5",
        className,
      )}
      {...props}
    >
      <div className="flex flex-wrap gap-3">{children}</div>
    </div>
  );
}

function ActionToolbarButton({
  label,
  icon: Icon,
  variant = "default",
  className,
  type = "button",
  style,
  ...props
}: ActionToolbarButtonProps) {
  const primaryStyle =
    variant === "primary"
      ? { backgroundColor: PRIMARY_NAVY, ...style }
      : variant === "destructive"
        ? { backgroundColor: CANCEL_BG, color: CANCEL_FG, ...style }
        : style;

  return (
    <button
      type={type}
      className={cn(
        "inline-flex min-h-[46px] items-center justify-center gap-2.5 rounded-lg border px-[18px] py-3.5",
        "text-[15px] font-medium leading-none transition-all duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f2a44]/30 focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        "[&_svg]:size-[18px] [&_svg]:shrink-0",
        variantStyles[variant],
        variant === "destructive" && "[&_svg]:text-[#b91c1c]",
        className,
      )}
      style={primaryStyle}
      {...props}
    >
      {Icon ? <Icon aria-hidden /> : null}
      <span>{label}</span>
    </button>
  );
}

export interface ActionToolbarMenuButtonProps
  extends Omit<ActionToolbarButtonProps, "onClick"> {
  items: ActionToolbarMenuItem[];
  onOpenChange?: (open: boolean) => void;
}

function ActionToolbarMenuButton({
  label,
  icon: Icon,
  items,
  className,
  onOpenChange,
  ...buttonProps
}: ActionToolbarMenuButtonProps) {
  return (
    <DropdownMenu onOpenChange={onOpenChange}>
      <DropdownMenuTrigger
        type="button"
        className={cn(
          "inline-flex min-h-[46px] items-center justify-center gap-2.5 rounded-lg border px-[18px] py-3.5",
          "text-[15px] font-medium leading-none transition-all duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f2a44]/30 focus-visible:ring-offset-2",
          "[&_svg]:size-[18px] [&_svg]:shrink-0",
          variantStyles.default,
          className,
        )}
        {...buttonProps}
      >
        {Icon ? <Icon aria-hidden /> : null}
        <span>{label}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[12rem]">
        {items.map((item) => (
          <DropdownMenuItem
            key={item.label}
            disabled={item.disabled}
            onClick={item.onSelect}
          >
            {item.icon ? (
              <item.icon className="size-4 text-muted-foreground" aria-hidden />
            ) : null}
            {item.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const ActionToolbar = Object.assign(ActionToolbarRoot, {
  Button: ActionToolbarButton,
  MenuButton: ActionToolbarMenuButton,
});
