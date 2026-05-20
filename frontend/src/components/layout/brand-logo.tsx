import { Smile } from "lucide-react";
import { BRAND } from "@/constants/navigation";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  collapsed?: boolean;
  className?: string;
}

export function BrandLogo({ collapsed, className }: BrandLogoProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-dark text-primary-foreground shadow-sm">
        <Smile className="size-5" strokeWidth={2.25} />
      </div>
      {!collapsed ? (
        <div className="min-w-0 leading-tight">
          <p className="truncate text-sm font-semibold tracking-tight text-foreground">
            {BRAND.name}
          </p>
          <p className="truncate text-[11px] text-muted-foreground">{BRAND.tagline}</p>
        </div>
      ) : null}
    </div>
  );
}
