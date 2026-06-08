"use client";

import {
  ArrowLeft,
  KeyRound,
  Loader2,
  Pencil,
  ScrollText,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { RepairsTopNav } from "@/components/repairs/repairs-top-nav";
import { ProfileChangePasswordDialog } from "@/components/profile/profile-change-password-dialog";
import { ProfileEditDialog } from "@/components/profile/profile-edit-dialog";
import {
  ProfileFieldGrid,
  ProfileGlassCard,
  ProfileStatusBadge,
} from "@/components/profile/profile-ui";
import { Button } from "@/components/ui/button";
import { useMyProfile } from "@/hooks/use-my-profile";
import { cn } from "@/lib/utils";

function ProfileLoadingState() {
  return (
    <div className="flex min-h-[320px] items-center justify-center">
      <Loader2 className="size-8 animate-spin text-(--repair-primary)" aria-hidden />
      <span className="sr-only">Loading profile</span>
    </div>
  );
}

function ProfileErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-[#FECACA] bg-[#FEF2F2] p-6 text-center dark:border-red-500/30 dark:bg-red-500/10">
      <p className="text-sm font-medium text-[#B91C1C] dark:text-red-300">{message}</p>
    </div>
  );
}

export function MyProfilePage() {
  const router = useRouter();
  const { data: profile, isLoading, isError, error, refetch } = useMyProfile();
  const [editOpen, setEditOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);

  const handleActivityLog = () => {
    router.push("/reports/transaction-log?scope=mine");
  };

  return (
    <div className="repairs-pos-theme flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-pos-page">
      <RepairsTopNav />
      <div className="min-h-0 flex-1 overflow-auto">
        <div className="mx-auto w-full max-w-[1200px] space-y-5 p-4 md:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => router.back()}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-[#6B7280] transition-colors hover:text-(--repair-primary) dark:text-white/70"
              >
                <ArrowLeft className="size-4" />
                Back
              </button>
              <h1 className="text-2xl font-bold tracking-tight text-[#111827] dark:text-[#f4f4f5] md:text-3xl">
                My Profile
              </h1>
              <p className="text-sm text-[#6B7280] dark:text-white/65">
                View and manage your account details, work status, and security settings.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-lg border-[#E5E7EB] dark:border-white/10 dark:bg-[#16161c] dark:text-[#f4f4f5]"
                onClick={() => setEditOpen(true)}
              >
                <Pencil className="size-4" />
                Edit Profile
              </Button>
              <Button
                type="button"
                variant="outline"
                className="rounded-lg border-[#E5E7EB] dark:border-white/10 dark:bg-[#16161c] dark:text-[#f4f4f5]"
                onClick={() => setPasswordOpen(true)}
              >
                <KeyRound className="size-4" />
                Change Password
              </Button>
              <Button
                type="button"
                variant="outline"
                className="rounded-lg border-[#E5E7EB] dark:border-white/10 dark:bg-[#16161c] dark:text-[#f4f4f5]"
                onClick={handleActivityLog}
              >
                <ScrollText className="size-4" />
                View Activity Log
              </Button>
            </div>
          </div>

          {isLoading ? <ProfileLoadingState /> : null}
          {isError ? (
            <ProfileErrorState
              message={error instanceof Error ? error.message : "Could not load profile."}
            />
          ) : null}

          {profile ? (
            <>
              <section
                className={cn(
                  "relative overflow-hidden rounded-2xl border border-[#E5E7EB]/80 p-6 shadow-[0_10px_30px_rgba(15,23,42,0.08)] backdrop-blur-md",
                  "bg-linear-to-br from-white via-white to-[#FFF7ED]/60",
                  "dark:border-white/10 dark:bg-[#101014]/90 dark:from-[#101014] dark:via-[#121218] dark:to-[#18181D] dark:shadow-[0_8px_24px_rgba(0,0,0,0.35)]",
                )}
              >
                <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-linear-to-b from-white/50 to-transparent dark:from-white/10" />
                <div className="relative flex flex-col gap-5 md:flex-row md:items-center">
                  <div
                    className="flex size-20 shrink-0 items-center justify-center rounded-full bg-[#E5E7EB] text-2xl font-bold text-[#374151] dark:bg-white/10 dark:text-[#f4f4f5]"
                    aria-hidden
                  >
                    {profile.avatarInitials}
                  </div>
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-2xl font-bold text-[#111827] dark:text-[#f4f4f5]">
                        {profile.fullName}
                      </h2>
                      <ProfileStatusBadge status={profile.accountStatus} />
                    </div>
                    <p className="text-sm font-medium text-(--repair-primary)">
                      {profile.roleLabel}
                    </p>
                    <p className="text-sm text-[#6B7280] dark:text-white/70">{profile.email}</p>
                    {profile.lastLogin ? (
                      <p className="text-xs text-[#9CA3AF] dark:text-white/55">
                        Last login: {profile.lastLogin}
                      </p>
                    ) : null}
                  </div>
                </div>
              </section>

              <div className="grid gap-5 lg:grid-cols-2">
                <ProfileGlassCard title="Personal Information">
                  <ProfileFieldGrid
                    fields={[
                      { label: "Full Name", value: profile.fullName },
                      { label: "Username", value: profile.username },
                      { label: "Email", value: profile.email },
                      { label: "Phone Number", value: profile.phone },
                      { label: "Role", value: profile.roleLabel },
                      { label: "Account Status", value: profile.accountStatus },
                      { label: "Created Date", value: profile.createdDate },
                      { label: "Last Login", value: profile.lastLogin },
                    ]}
                  />
                </ProfileGlassCard>

                <ProfileGlassCard title="Store & Role Details">
                  <ProfileFieldGrid
                    fields={[
                      { label: "Store / Branch", value: profile.storeBranch },
                      { label: "Employee ID", value: profile.employeeId },
                      { label: "Assigned Location", value: profile.assignedLocation },
                      { label: "Permissions / Access Level", value: profile.accessLevel },
                    ]}
                  />
                </ProfileGlassCard>

                <ProfileGlassCard title="Shift & Work Status">
                  <ProfileFieldGrid
                    fields={[
                      {
                        label: "Current Shift Status",
                        value: profile.shift.currentShiftStatus,
                      },
                      { label: "Clock In Time", value: profile.shift.clockInTime },
                      { label: "Clock Out Time", value: profile.shift.clockOutTime },
                      {
                        label: "Start Shift Status",
                        value: profile.shift.startShiftStatus,
                      },
                      { label: "Cash In / Cash Out Status", value: profile.shift.cashInOutStatus },
                      { label: "Store Assigned", value: profile.shift.storeAssigned },
                    ]}
                  />
                </ProfileGlassCard>

                <ProfileGlassCard title="Commission Summary">
                  <ProfileFieldGrid
                    fields={[
                      { label: "Total Commission", value: profile.commission.totalCommission },
                      { label: "Pending Commission", value: profile.commission.pendingCommission },
                      { label: "Paid Commission", value: profile.commission.paidCommission },
                      { label: "Sales Count", value: profile.commission.salesCount },
                      {
                        label: "Repair Jobs Handled",
                        value: profile.commission.repairJobsHandled,
                      },
                    ]}
                  />
                </ProfileGlassCard>
              </div>

              <ProfileGlassCard
                title="Security & Account Settings"
                description="Manage authentication and account access preferences."
              >
                <div className="grid gap-5 lg:grid-cols-2">
                  <ProfileFieldGrid
                    fields={[
                      { label: "Password", value: "••••••••" },
                      {
                        label: "Login Enabled",
                        value: profile.loginEnabled ? "Enabled" : "Disabled",
                      },
                      {
                        label: "Two-Factor Authentication",
                        value:
                          profile.twoFactorEnabled === null
                            ? null
                            : profile.twoFactorEnabled
                              ? "Enabled"
                              : "Disabled",
                      },
                    ]}
                  />
                  <div className="flex flex-col justify-center gap-3">
                    <div className="flex items-start gap-3 rounded-xl border border-[#E5E7EB]/80 bg-[#FAFAFA] p-4 dark:border-white/10 dark:bg-white/5">
                      <Shield className="mt-0.5 size-5 shrink-0 text-(--repair-primary)" />
                      <div>
                        <p className="text-sm font-semibold text-[#111827] dark:text-[#f4f4f5]">
                          Account security
                        </p>
                        <p className="mt-1 text-sm text-[#6B7280] dark:text-white/65">
                          Keep your password secure and review your access permissions regularly.
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        className="rounded-lg bg-(--repair-primary) text-white hover:opacity-90"
                        onClick={() => setPasswordOpen(true)}
                      >
                        Change Password
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-lg dark:border-white/10 dark:bg-[#16161c]"
                        onClick={() => setEditOpen(true)}
                      >
                        Edit Profile
                      </Button>
                    </div>
                  </div>
                </div>
              </ProfileGlassCard>

              <p className="pb-2 text-center text-xs text-[#9CA3AF] dark:text-white/45">
                Need help? Visit the{" "}
                <Link href="/knowledge-base" className="font-medium text-(--repair-primary) hover:underline">
                  Knowledge Base
                </Link>
                .
              </p>
            </>
          ) : null}

          <ProfileEditDialog
            open={editOpen}
            onOpenChange={(open) => {
              setEditOpen(open);
              if (!open) void refetch();
            }}
            profile={profile ?? null}
          />
          <ProfileChangePasswordDialog
            open={passwordOpen}
            onOpenChange={setPasswordOpen}
            profile={profile ?? null}
          />
        </div>
      </div>
    </div>
  );
}
