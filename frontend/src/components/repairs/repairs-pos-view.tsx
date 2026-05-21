"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import type { PosTab, RepairStep } from "@/lib/repairs-pos-data";
import { RepairsThemeProvider, useRepairsTheme } from "@/context/repairs-theme-context";
import { RepairsTopNav } from "@/components/repairs/repairs-top-nav";
import { RepairsPosBar } from "@/components/repairs/repairs-pos-bar";
import { RepairsCartPanel } from "@/components/repairs/repairs-cart-panel";
import { RepairsCategoryPanel } from "@/components/repairs/repairs-category-panel";
import { RepairsSideToolbar } from "@/components/repairs/repairs-side-toolbar";

function RepairsPosContent() {
  const { cssVariables } = useRepairsTheme();
  const [activeTab, setActiveTab] = useState<PosTab>("Repairs");
  const [activeStep, setActiveStep] = useState<RepairStep>("Category");
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-pos-animate]",
        { opacity: 0, y: 10 },
        {
          opacity: 1,
          y: 0,
          duration: 0.45,
          stagger: 0.06,
          ease: "power2.out",
        },
      );
    }, mainRef);
    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={mainRef}
      className="repairs-pos-theme flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-[#F8FAFC]"
      style={cssVariables}
    >
      <div data-pos-animate>
        <RepairsTopNav />
      </div>
      <div data-pos-animate>
        <RepairsPosBar activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <div
          data-pos-animate
          className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden lg:flex-row"
        >
          <RepairsCartPanel />
          <RepairsCategoryPanel
            activeStep={activeStep}
            onStepChange={setActiveStep}
          />
        </div>
        <div data-pos-animate>
          <RepairsSideToolbar />
        </div>
      </div>
    </div>
  );
}

export function RepairsPosView() {
  return (
    <RepairsThemeProvider>
      <RepairsPosContent />
    </RepairsThemeProvider>
  );
}
