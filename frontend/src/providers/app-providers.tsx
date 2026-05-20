"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "./query-provider";
import { StoreProvider } from "./store-provider";
import { ThemeProvider } from "./theme-provider";
import { AuthHydrator } from "./auth-hydrator";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      <QueryProvider>
        <ThemeProvider>
          <TooltipProvider>
            <AuthHydrator />
            {children}
            <Toaster richColors position="top-right" closeButton />
          </TooltipProvider>
        </ThemeProvider>
      </QueryProvider>
    </StoreProvider>
  );
}
