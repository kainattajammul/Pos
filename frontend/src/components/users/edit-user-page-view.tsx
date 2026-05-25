"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { UserForm } from "@/components/users/user-form";
import { APP_CONFIG } from "@/constants/config";

interface EditUserPageViewProps {
  userId: number;
}

export function EditUserPageView({ userId }: EditUserPageViewProps) {
  return (
    <div className="mx-auto max-w-[1600px] pb-4">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <Link
            href="/users"
            className="inline-flex items-center gap-1 text-xs font-medium text-neutral-500 transition hover:text-primary"
          >
            <ChevronLeft className="size-3.5" />
            Back to users
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 md:text-3xl">
            Edit user
          </h1>
        </div>
      </div>

      <UserForm mode="edit" userId={userId} />

      <p className="mt-8 text-center text-xs text-neutral-500">
        © {new Date().getFullYear()} {APP_CONFIG.appName}. All rights reserved.
      </p>
    </div>
  );
}
