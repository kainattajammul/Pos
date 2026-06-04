"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PosTab } from "@/lib/repairs-pos-data";
import { RepairTicketProvider } from "@/contexts/repair-ticket-context";
import { RepairsTopNav } from "@/components/repairs/repairs-top-nav";
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
    <div className="flex min-h-0 min-w-0 flex-1 items-center justify-center bg-white text-sm text-[#6B7280]">
      Loading…
    </div>
  );
}

function RepairsMainPanel({
  activeTab,
  providerProps,
  onProviderPropsChange,
}: {
  activeTab: PosTab;
  providerProps: RepairWorkspaceProviderProps;
  onProviderPropsChange: (props: RepairWorkspaceProviderProps) => void;
}) {
  if (activeTab === "Repairs") {
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
  const [showCart, setShowCart] = useState(false);
  const onProviderPropsChangeRef = useRef<(props: RepairWorkspaceProviderProps) => void>(
    setProviderProps,
  );
  onProviderPropsChangeRef.current = setProviderProps;

  const handleProviderPropsChange = (props: RepairWorkspaceProviderProps) => {
    onProviderPropsChangeRef.current(props);
  };

  useEffect(() => {
    setShowCart(true);
  }, []);

  return (
    <div className="repairs-pos-theme flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-[#F8FAFC]">
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
              onProviderPropsChange={handleProviderPropsChange}
            />
          </div>
        </div>
      </RepairTicketProvider>
    </div>
  );
}
