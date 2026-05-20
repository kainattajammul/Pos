"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { useAppSelector } from "@/store/hooks";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, hydrated } = useAppSelector((s) => s.auth);

  useEffect(() => {
    if (hydrated && !isAuthenticated) {
      router.replace("/login");
    }
  }, [hydrated, isAuthenticated, router]);

  if (!hydrated) {
    return <DashboardSkeleton />;
  }

  if (!isAuthenticated) {
    return <DashboardSkeleton />;
  }

  return <>{children}</>;
}
