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

export type ActionToolbarVariant = "default" | "primary" | "destructive";
export type ActionToolbarTone = "default" | "repair";

const variantStyles: Record<ActionToolbarVariant, string> = {
  default: cn(
    "border-pos bg-pos-surface text-pos shadow-pos-sm",
    "hover:border-pos-strong hover:bg-pos-hover hover:shadow-pos-md",
    "active:bg-pos-muted",
  ),
  primary: cn(
    "border-transparent shadow-sm",
    "hover:opacity-90 active:opacity-95",
  ),
  destructive: cn(
    "border-pos-error-ring bg-pos-error-bg text-pos-error-text shadow-pos-sm",
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
  /** When `primary`, use repair POS theme colors (`--repair-primary`, etc.). */
  tone?: ActionToolbarTone;
}

function ActionToolbarRoot({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "shrink-0 border-t border-pos bg-pos-surface px-4 py-3.5 dark:bg-neutral-900",
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
  tone = "default",
  className,
  type = "button",
  style,
  ...props
}: ActionToolbarButtonProps) {
  const isRepairPrimary = variant === "primary" && tone === "repair";

  const primaryStyle =
    variant === "primary"
      ? tone === "repair"
        ? {
            background: `linear-gradient(135deg, var(--repair-primary) 0%, var(--repair-accent-end) 100%)`,
            color: "var(--repair-on-primary)",
            ...style,
          }
        : { backgroundColor: PRIMARY_NAVY, color: "#ffffff", ...style }
      : style;

  return (
    <button
      type={type}
      className={cn(
        "inline-flex min-h-[46px] items-center justify-center gap-2.5 rounded-lg border px-[18px] py-3.5",
        "text-[15px] font-medium leading-none transition-all duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        isRepairPrimary
          ? "focus-visible:ring-[var(--repair-primary)]/35"
          : "focus-visible:ring-(--repair-primary,var(--primary))/30",
        "disabled:pointer-events-none disabled:opacity-50",
        "[&_svg]:size-[18px] [&_svg]:shrink-0",
        variantStyles[variant],
        variant === "destructive" && "[&_svg]:text-pos-error-text",
        isRepairPrimary && "[&_svg]:text-[var(--repair-on-primary)]",
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
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--repair-primary,var(--primary))/30 focus-visible:ring-offset-2",
          "[&_svg]:size-[18px] [&_svg]:shrink-0",
          variantStyles.default,
          className,
        )}
        {...buttonProps}
      >
        {Icon ? <Icon aria-hidden /> : null}
        <span>{label}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="pos-dropdown min-w-[12rem]">
        {items.map((item) => (
          <DropdownMenuItem
            key={item.label}
            disabled={item.disabled}
            onClick={item.onSelect}
          >
            {item.icon ? (
              <item.icon className="size-4 text-pos-muted" aria-hidden />
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
