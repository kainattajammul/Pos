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
import {
  profilePasswordSchema,
  type ProfilePasswordValues,
} from "@/lib/profile-form";
import type { UserProfileViewModel } from "@/types/user-profile";

const inputClass =
  "h-10 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 text-sm dark:border-white/10 dark:bg-[#16161c] dark:text-[#f4f4f5]";

interface ProfileChangePasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: UserProfileViewModel | null;
}

export function ProfileChangePasswordDialog({
  open,
  onOpenChange,
  profile,
}: ProfileChangePasswordDialogProps) {
  const { changePassword, isChangingPassword } = useUpdateMyProfile();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfilePasswordValues>({
    resolver: zodResolver(profilePasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (!open) return;
    reset({ password: "", confirmPassword: "" });
  }, [open, reset]);

  const onSubmit = async (values: ProfilePasswordValues) => {
    if (!profile) return;
    await changePassword({ profile, values });
    onOpenChange(false);
    reset({ password: "", confirmPassword: "" });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-md gap-0 overflow-hidden rounded-2xl p-0 dark:border-white/10 dark:bg-[#101014]">
        <DialogHeader className="border-b border-[#E5E7EB] px-6 py-4 dark:border-white/10">
          <DialogTitle className="text-lg dark:text-[#f4f4f5]">Change Password</DialogTitle>
          <DialogDescription className="dark:text-white/65">
            Choose a strong password with at least 8 characters.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-6 py-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#374151] dark:text-white/80">
              New password
            </label>
            <Input
              type="password"
              autoComplete="new-password"
              className={inputClass}
              disabled={isChangingPassword}
              {...register("password")}
            />
            {errors.password ? (
              <p className="text-xs text-[#DC2626]">{errors.password.message}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#374151] dark:text-white/80">
              Confirm password
            </label>
            <Input
              type="password"
              autoComplete="new-password"
              className={inputClass}
              disabled={isChangingPassword}
              {...register("confirmPassword")}
            />
            {errors.confirmPassword ? (
              <p className="text-xs text-[#DC2626]">{errors.confirmPassword.message}</p>
            ) : null}
          </div>

          <DialogFooter className="gap-2 border-t border-[#E5E7EB] px-0 pt-4 dark:border-white/10">
            <Button
              type="button"
              variant="outline"
              disabled={isChangingPassword}
              onClick={() => onOpenChange(false)}
              className="dark:border-white/10 dark:bg-[#16161c]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isChangingPassword}
              className="bg-(--repair-primary) text-white hover:opacity-90"
            >
              {isChangingPassword ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Updating…
                </>
              ) : (
                "Update password"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
