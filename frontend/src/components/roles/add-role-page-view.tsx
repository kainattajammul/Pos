"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { RoleForm } from "@/components/roles/role-form";
import { APP_CONFIG } from "@/constants/config";

export function AddRolePageView() {
  return (
    <div className="mx-auto max-w-[1600px] pb-4">
      <div className="mb-4 space-y-1">
        <Link
          href="/roles"
          className="inline-flex items-center gap-1 text-xs font-medium text-neutral-500 transition hover:text-primary"
        >
          <ChevronLeft className="size-3.5" />
          Back to roles
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 md:text-3xl">
          Add Role
        </h1>
      </div>

      <RoleForm mode="add" />

      <p className="mt-8 text-center text-xs text-neutral-500">
        © {new Date().getFullYear()} {APP_CONFIG.appName}. All rights reserved.
      </p>
    </div>
  );
}
