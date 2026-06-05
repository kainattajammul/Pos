"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PosTab } from "@/lib/repairs-pos-data";
import { RepairTicketProvider } from "@/contexts/repair-ticket-context";

const RepairsTopNav = dynamic(
  () => import("@/components/repairs/repairs-top-nav").then((m) => m.RepairsTopNav),
  { ssr: false },
);
import { RepairsPosBar } from "@/components/repairs/repairs-pos-bar";
import type { RepairWorkspaceProviderProps } from "@/components/repairs/repairs-pos-provider-types";

const EMPTY_PROVIDER_PROPS: RepairWorkspaceProviderProps = {
  selectedCategoryId: null,
  selectedCategoryLabel: null,
  selectedManufacturerId: null,
  selectedDeviceId: null,
  selectedProblemIds: [],
  selectedPartIds: [],
  devices: [],
  manufacturers: [],
  problems: [],
  parts: [],
};

const RepairsCartPanel = dynamic(
  () =>
    import("@/components/repairs/repairs-cart-panel").then((m) => m.RepairsCartPanel),
  { ssr: false },
);

const RepairsPosRepairWorkspace = dynamic(
  () =>
    import("@/components/repairs/repairs-pos-workspace-core").then(
      (m) => m.RepairsPosWorkspaceCore,
    ),
  { ssr: false, loading: () => <RepairsPanelSkeleton /> },
);

const RepairsUnlockingPanel = dynamic(
  () =>
    import("@/components/repairs/repairs-unlocking-panel").then(
      (m) => m.RepairsUnlockingPanel,
    ),
  { ssr: false, loading: () => <RepairsPanelSkeleton /> },
);

const RepairsProductsPanel = dynamic(
  () =>
    import("@/components/repairs/repairs-products-panel").then(
      (m) => m.RepairsProductsPanel,
    ),
  { ssr: false, loading: () => <RepairsPanelSkeleton /> },
);

const RepairsTradeInPanel = dynamic(
  () =>
    import("@/components/repairs/repairs-tradein-panel").then((m) => m.RepairsTradeInPanel),
  { ssr: false, loading: () => <RepairsPanelSkeleton /> },
);

const RepairsMiscPanel = dynamic(
  () =>
    import("@/components/repairs/repairs-misc-panel").then((m) => m.RepairsMiscPanel),
  { ssr: false, loading: () => <RepairsPanelSkeleton /> },
);

const RepairsPosTabPlaceholder = dynamic(
  () =>
    import("@/components/repairs/repairs-pos-tab-placeholder").then(
      (m) => m.RepairsPosTabPlaceholder,
    ),
  { ssr: false, loading: () => <RepairsPanelSkeleton /> },
);

function RepairsPanelSkeleton() {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 items-center justify-center bg-pos-surface text-sm text-pos-muted">
      Loading…
    </div>
  );
}

function RepairsMainPanel({
  activeTab,
  providerProps,
  workspaceReady,
  onProviderPropsChange,
}: {
  activeTab: PosTab;
  providerProps: RepairWorkspaceProviderProps;
  workspaceReady: boolean;
  onProviderPropsChange: (props: RepairWorkspaceProviderProps) => void;
}) {
  if (activeTab === "Repairs") {
    if (!workspaceReady) {
      return <RepairsPanelSkeleton />;
    }
    return <RepairsPosRepairWorkspace onProviderPropsChange={onProviderPropsChange} />;
  }
  if (activeTab === "Unlocking") {
    return <RepairsUnlockingPanel />;
  }
  if (activeTab === "Products") {
    return (
      <RepairsProductsPanel
        selectedManufacturerId={providerProps.selectedManufacturerId}
        manufacturers={providerProps.manufacturers ?? []}
      />
    );
  }
  if (activeTab === "Trade In") {
    return <RepairsTradeInPanel />;
  }
  if (activeTab === "Miscellaneous") {
    return <RepairsMiscPanel />;
  }
  return <RepairsPosTabPlaceholder tab={activeTab} />;
}

export function RepairsPosView() {
  const [activeTab, setActiveTab] = useState<PosTab>("Repairs");
  const [providerProps, setProviderProps] =
    useState<RepairWorkspaceProviderProps>(EMPTY_PROVIDER_PROPS);
  const [workspaceReady, setWorkspaceReady] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const onProviderPropsChangeRef = useRef<(props: RepairWorkspaceProviderProps) => void>(
    setProviderProps,
  );
  onProviderPropsChangeRef.current = setProviderProps;

  const handleProviderPropsChange = (props: RepairWorkspaceProviderProps) => {
    onProviderPropsChangeRef.current(props);
  };

  useEffect(() => {
    if (activeTab !== "Repairs") {
      setWorkspaceReady(true);
      setShowCart(true);
      return;
    }

    setWorkspaceReady(false);
    setShowCart(false);

    const enableWorkspace = () => setWorkspaceReady(true);
    if (typeof requestIdleCallback !== "undefined") {
      const id = requestIdleCallback(enableWorkspace, { timeout: 200 });
      return () => cancelIdleCallback(id);
    }
    const t = window.setTimeout(enableWorkspace, 0);
    return () => window.clearTimeout(t);
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== "Repairs" || !workspaceReady) {
      if (activeTab !== "Repairs") {
        setShowCart(true);
      }
      return;
    }
    void import("@/components/repairs/repairs-pos-workspace-core").then(() => {
      setShowCart(true);
    });
  }, [activeTab, workspaceReady]);

  return (
    <div className="repairs-pos-theme flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <RepairsTopNav />
      <RepairsPosBar activeTab={activeTab} onTabChange={setActiveTab} />

      <RepairTicketProvider {...providerProps}>
        <div className="flex min-h-0 flex-1 overflow-hidden">
          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden lg:flex-row">
            {showCart ? (
              <RepairsCartPanel />
            ) : (
              <div
                className="hidden w-[min(100%,320px)] shrink-0 lg:block lg:w-[320px]"
                aria-hidden
              />
            )}
            <RepairsMainPanel
              activeTab={activeTab}
              providerProps={providerProps}
              workspaceReady={workspaceReady}
              onProviderPropsChange={handleProviderPropsChange}
            />
          </div>
        </div>
      </RepairTicketProvider>
    </div>
  );
}
