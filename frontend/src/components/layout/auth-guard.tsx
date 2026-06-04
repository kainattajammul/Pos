"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AuthLoadingFallback } from "@/components/layout/auth-loading-fallback";
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
    return <AuthLoadingFallback />;
  }

  if (!isAuthenticated) {
    return <AuthLoadingFallback />;
  }

  return <>{children}</>;
}
