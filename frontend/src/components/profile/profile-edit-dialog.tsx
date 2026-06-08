"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useUpdateMyProfile } from "@/hooks/use-update-my-profile";
import { parseFullName } from "@/lib/add-user-form";
import {
  profileEditSchema,
  type ProfileEditValues,
} from "@/lib/profile-form";
import type { UserProfileViewModel } from "@/types/user-profile";

const inputClass =
  "h-10 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 text-sm dark:border-white/10 dark:bg-[#16161c] dark:text-[#f4f4f5]";

interface ProfileEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: UserProfileViewModel | null;
}

export function ProfileEditDialog({ open, onOpenChange, profile }: ProfileEditDialogProps) {
  const { updateProfile, isUpdatingProfile } = useUpdateMyProfile();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileEditValues>({
    resolver: zodResolver(profileEditSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      mobileNumber: "",
      username: "",
    },
  });

  useEffect(() => {
    if (!open || !profile) return;
    const parsed = parseFullName(profile.fullName);
    reset({
      firstName: parsed.firstName,
      lastName: parsed.lastName,
      email: profile.email,
      mobileNumber: profile.phone ?? "",
      username: profile.username ?? profile.email,
    });
  }, [open, profile, reset]);

  const onSubmit = async (values: ProfileEditValues) => {
    if (!profile) return;
    await updateProfile({ profile, values });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-lg gap-0 overflow-hidden rounded-2xl p-0 dark:border-white/10 dark:bg-[#101014]">
        <DialogHeader className="border-b border-[#E5E7EB] px-6 py-4 dark:border-white/10">
          <DialogTitle className="text-lg dark:text-[#f4f4f5]">Edit Profile</DialogTitle>
          <DialogDescription className="dark:text-white/65">
            Update your personal information. Changes sync to your account when available.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-6 py-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#374151] dark:text-white/80">
                First name
              </label>
              <Input className={inputClass} disabled={isUpdatingProfile} {...register("firstName")} />
              {errors.firstName ? (
                <p className="text-xs text-[#DC2626]">{errors.firstName.message}</p>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#374151] dark:text-white/80">
                Last name
              </label>
              <Input className={inputClass} disabled={isUpdatingProfile} {...register("lastName")} />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#374151] dark:text-white/80">Email</label>
            <Input
              type="email"
              className={inputClass}
              disabled={isUpdatingProfile}
              {...register("email")}
            />
            {errors.email ? (
              <p className="text-xs text-[#DC2626]">{errors.email.message}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#374151] dark:text-white/80">
              Phone number
            </label>
            <Input
              type="tel"
              className={inputClass}
              disabled={isUpdatingProfile}
              {...register("mobileNumber")}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#374151] dark:text-white/80">Username</label>
            <Input className={inputClass} disabled={isUpdatingProfile} {...register("username")} />
          </div>

          <DialogFooter className="gap-2 border-t border-[#E5E7EB] px-0 pt-4 dark:border-white/10">
            <Button
              type="button"
              variant="outline"
              disabled={isUpdatingProfile}
              onClick={() => onOpenChange(false)}
              className="dark:border-white/10 dark:bg-[#16161c]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isUpdatingProfile}
              className="bg-(--repair-primary) text-white hover:opacity-90"
            >
              {isUpdatingProfile ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving…
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
