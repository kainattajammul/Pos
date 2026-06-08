"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { useAuth } from "@/hooks/use-auth";
import { readSession, persistSession } from "@/lib/auth-session";
import { buildFullName, parseFullName, USER_FORM_DEFAULT_VALUES } from "@/lib/add-user-form";
import { loadUserProfileExtras, saveUserProfileExtras } from "@/lib/user-form-storage";
import { getApiErrorMessage } from "@/lib/axios";
import type { ProfileEditValues, ProfilePasswordValues } from "@/lib/profile-form";
import { updateUser } from "@/services/users.service";
import {
  logPasswordChanged,
  logProfileUpdated,
} from "@/services/transaction-log.service";
import { useAppDispatch } from "@/store/hooks";
import { setUser } from "@/store/auth-slice";
import type { AuthUser } from "@/types/api";
import type { UserProfileViewModel } from "@/types/user-profile";

function syncAuthUser(profile: UserProfileViewModel, fullName: string, email: string) {
  const session = readSession();
  if (!session?.user) return;

  const nextUser = {
    ...session.user,
    name: fullName,
    email,
  };
  persistSession({ ...session, user: nextUser });
  return nextUser;
}

export function useUpdateMyProfile() {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  const { user: authUser } = useAuth();

  const editMutation = useMutation({
    mutationFn: async ({
      profile,
      values,
    }: {
      profile: UserProfileViewModel;
      values: ProfileEditValues;
    }) => {
      const fullName = buildFullName(values);
      const phone = values.mobileNumber.trim() || null;
      const userId = Number(profile.id);

      if (Number.isFinite(userId) && userId > 0) {
        await updateUser(userId, {
          fullName,
          email: values.email.trim(),
          phone,
        });
      }

      const existingExtras = loadUserProfileExtras(userId) ?? {};
      const extras = {
        ...USER_FORM_DEFAULT_VALUES,
        ...existingExtras,
        ...parseFullName(fullName),
        email: values.email.trim(),
        mobileNumber: values.mobileNumber.trim(),
        username: values.username.trim() || values.email.trim(),
        allowLogin: existingExtras.allowLogin ?? true,
        isActive: existingExtras.isActive ?? true,
      };

      if (Number.isFinite(userId) && userId >= 0) {
        saveUserProfileExtras(userId, extras);
      }

      const nextAuthUser = syncAuthUser(profile, fullName, values.email.trim());
      if (nextAuthUser && authUser) {
        dispatch(setUser({ ...authUser, name: fullName, email: values.email.trim() }));
      }

      logProfileUpdated(
        authUser ?? {
          id: profile.id,
          name: fullName,
          email: values.email.trim(),
          role: profile.role as AuthUser["role"],
        },
        "Profile details were updated from My Profile",
      );

      return { fullName, email: values.email.trim() };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactionLog.all });
      toast.success("Profile updated successfully");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Failed to update profile"));
    },
  });

  const passwordMutation = useMutation({
    mutationFn: async ({
      profile,
      values,
    }: {
      profile: UserProfileViewModel;
      values: ProfilePasswordValues;
    }) => {
      const userId = Number(profile.id);
      if (!Number.isFinite(userId) || userId <= 0) {
        throw new Error("Password change requires a synced database account.");
      }

      await updateUser(userId, { password: values.password });

      if (authUser) {
        logPasswordChanged(authUser);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactionLog.all });
      toast.success("Password updated successfully");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error && !("response" in error)
          ? error.message
          : getApiErrorMessage(error, "Failed to change password"),
      );
    },
  });

  return {
    updateProfile: editMutation.mutateAsync,
    changePassword: passwordMutation.mutateAsync,
    isUpdatingProfile: editMutation.isPending,
    isChangingPassword: passwordMutation.isPending,
  };
}
