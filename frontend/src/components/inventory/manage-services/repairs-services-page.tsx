"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { RepairsTopNav } from "@/components/repairs/repairs-top-nav";
import { RepairsServicesFilters } from "@/components/inventory/manage-services/repairs-services-filters";
import { RepairsServicesTable } from "@/components/inventory/manage-services/repairs-services-table";
import { RepairsServicesToolbar } from "@/components/inventory/manage-services/repairs-services-toolbar";
import {
  DEFAULT_REPAIRS_FILTERS,
  filterRepairsServices,
  MOCK_REPAIRS_SERVICES,
  type RepairsServiceFilters,
} from "@/components/inventory/manage-services/repairs-services-types";

export function RepairsServicesPage() {
  const [draftFilters, setDraftFilters] =
    useState<RepairsServiceFilters>(DEFAULT_REPAIRS_FILTERS);
  const [appliedFilters, setAppliedFilters] =
    useState<RepairsServiceFilters | null>(null);

  const filteredRows = useMemo(() => {
    if (!appliedFilters) return [];
    return filterRepairsServices(MOCK_REPAIRS_SERVICES, appliedFilters);
  }, [appliedFilters]);

  const handleSearch = () => {
    setAppliedFilters({ ...draftFilters });
  };

  const handleReset = () => {
    setDraftFilters(DEFAULT_REPAIRS_FILTERS);
    setAppliedFilters(null);
  };

  return (
    <div className="repairs-pos-theme flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-pos-page">
      <RepairsTopNav />
      <main className="flex-1 overflow-auto">
        <div className="mx-auto w-full max-w-[1600px] space-y-4 p-4 md:p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 space-y-1">
              <h1 className="text-xl font-semibold text-pos md:text-2xl">Manage Services</h1>
              <nav className="pos-breadcrumb" aria-label="Breadcrumb">
                <Link href="/dashboard">Home</Link>
                <span className="mx-1.5 text-pos-subtle">/</span>
                <span className="font-medium text-pos-secondary">Manage Services</span>
              </nav>
            </div>
            <RepairsServicesToolbar />
          </div>

          <RepairsServicesFilters
            value={draftFilters}
            onChange={setDraftFilters}
            onSearch={handleSearch}
            onReset={handleReset}
            onUnpin={() => toast.message("Unpin filter — coming soon")}
            onSave={() => toast.message("Save filter — coming soon")}
          />

          <RepairsServicesTable rows={filteredRows} />
        </div>
      </main>
    </div>
  );
}
