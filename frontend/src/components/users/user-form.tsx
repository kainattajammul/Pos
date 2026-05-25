"use client";

import { useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useCreateUser, useUpdateUser, useUser } from "@/hooks/use-users";
import { useRoles } from "@/hooks/use-roles";
import {
  BLOOD_GROUP_OPTIONS,
  GENDER_OPTIONS,
  MARITAL_STATUS_OPTIONS,
  PREFIX_OPTIONS,
  USER_FORM_DEFAULT_VALUES,
  addUserFormSchema,
  buildFullName,
  editUserFormSchema,
  mapUserToFormValues,
  resolvePhone,
  type UserFormValues,
} from "@/lib/add-user-form";
import { loadUserProfileExtras, saveUserProfileExtras } from "@/lib/user-form-storage";
import { cn } from "@/lib/utils";
import type { CreateUserPayload, UpdateUserPayload } from "@/types/user-table";
import {
  FormSection,
  Field,
  FieldGrid,
  CheckboxField,
  inputClass,
} from "@/components/users/user-form-primitives";

export type UserFormMode = "add" | "edit";

interface UserFormProps {
  mode: UserFormMode;
  userId?: number;
  formId?: string;
}

export function UserForm({ mode, userId, formId }: UserFormProps) {
  const isEdit = mode === "edit";
  const resolvedFormId = formId ?? (isEdit ? "edit-user-form" : "add-user-form");
  const router = useRouter();
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const { data: roles = [], isLoading: rolesLoading } = useRoles();
  const {
    data: user,
    isPending: userPending,
    isFetching: userFetching,
    isError: userError,
    isFetched: userFetched,
  } = useUser(userId ?? 0);

  const userLoading = userPending || (userFetching && !user);

  const schema = isEdit ? editUserFormSchema : addUserFormSchema;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(schema) as Resolver<UserFormValues>,
    defaultValues: USER_FORM_DEFAULT_VALUES,
  });

  const prefix = watch("prefix");
  const roleId = watch("roleId");
  const gender = watch("gender");
  const maritalStatus = watch("maritalStatus");
  const bloodGroup = watch("bloodGroup");
  const isActive = watch("isActive");
  const allowLogin = watch("allowLogin");
  const allLocations = watch("allLocations");
  const locationSuperadmin = watch("locationSuperadmin");
  const allowSelectedContacts = watch("allowSelectedContacts");

  useEffect(() => {
    if (isEdit) return;
    if (roleId || roles.length === 0) return;
    setValue("roleId", String(roles[0].id));
  }, [isEdit, roles, roleId, setValue]);

  useEffect(() => {
    if (!isEdit || !user || rolesLoading) return;
    const defaultRoleId = roles[0] ? String(roles[0].id) : "";
    const extras = loadUserProfileExtras(user.id);
    reset(mapUserToFormValues(user, extras, extras?.roleId ?? defaultRoleId));
  }, [isEdit, user, roles, rolesLoading, reset]);

  const onSubmit = (values: UserFormValues) => {
    if (isEdit) {
      if (!userId) return;
      const payload: UpdateUserPayload = {
        fullName: buildFullName(values),
        email: values.email.trim(),
        phone: resolvePhone(values),
      };
      const pw = values.password.trim();
      if (pw) payload.password = pw;
      const pin = values.accessPin.trim();
      if (pin) payload.accessPin = pin;

      updateMutation.mutate(
        { id: userId, payload },
        {
          onSuccess: () => {
            saveUserProfileExtras(userId, values);
            router.push("/users");
          },
        },
      );
      return;
    }

    const selectedRole = roles.find((r) => String(r.id) === values.roleId);
    if (!selectedRole?.shopId) return;

    const payload: CreateUserPayload = {
      fullName: buildFullName(values),
      email: values.email.trim(),
      password: values.password,
      accessPin: values.accessPin.trim(),
      phone: resolvePhone(values),
      shopId: selectedRole.shopId,
      roleId: Number(values.roleId),
      status: values.isActive ? "ACTIVE" : "INACTIVE",
    };

    createMutation.mutate(payload, {
      onSuccess: () => router.push("/users"),
    });
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  if (isEdit && userLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (isEdit && userFetched && !userLoading && (userError || !user)) {
    return (
      <div className="rounded-lg border border-dashed border-neutral-200 bg-white p-8 text-center">
        <p className="text-sm text-neutral-600">
          User not found. Open the users list first or sign in if the API requires authentication.
        </p>
        <Button type="button" variant="outline" className="mt-4" onClick={() => router.push("/users")}>
          Back to users
        </Button>
      </div>
    );
  }

  return (
    <>
      <form
        id={resolvedFormId}
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
        noValidate
      >
        <FormSection title="Basic user details">
          <FieldGrid>
            <Field label="Prefix">
              <Select
                value={prefix || "none"}
                onValueChange={(v) => setValue("prefix", v === "none" ? "" : (v ?? ""))}
              >
                <SelectTrigger className={cn("w-full", inputClass)}>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">—</SelectItem>
                  {PREFIX_OPTIONS.filter(Boolean).map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="First name" required error={errors.firstName?.message}>
              <Input className={inputClass} disabled={isSubmitting} {...register("firstName")} />
            </Field>
            <Field label="Last name">
              <Input className={inputClass} disabled={isSubmitting} {...register("lastName")} />
            </Field>
            <Field label="Email" required error={errors.email?.message}>
              <Input
                type="email"
                autoComplete="email"
                className={inputClass}
                disabled={isSubmitting}
                {...register("email")}
              />
            </Field>
          </FieldGrid>
          <CheckboxField
            id="isActive"
            label="Is active"
            checked={isActive}
            onCheckedChange={(v) => setValue("isActive", v)}
            disabled={isSubmitting}
          />
        </FormSection>

        <FormSection title="Roles and permissions">
          <FieldGrid cols={3}>
            <div className="flex flex-col gap-3 sm:col-span-3 lg:col-span-1">
              <CheckboxField
                id="allowLogin"
                label="Allow login"
                checked={allowLogin}
                onCheckedChange={(v) => setValue("allowLogin", v)}
                disabled={isSubmitting}
              />
            </div>
            <Field label="Username">
              <Input className={inputClass} disabled={isSubmitting} {...register("username")} />
              {isEdit ? (
                <p className="text-[11px] text-muted-foreground">
                  Leave blank to keep the current username.
                </p>
              ) : null}
            </Field>
            <Field
              label="Password"
              required={!isEdit}
              error={errors.password?.message}
            >
              <Input
                type="password"
                autoComplete="new-password"
                className={inputClass}
                disabled={isSubmitting}
                placeholder={isEdit ? "Leave blank to keep current" : undefined}
                {...register("password")}
              />
            </Field>
            <Field
              label="Confirm password"
              required={!isEdit}
              error={errors.confirmPassword?.message}
            >
              <Input
                type="password"
                autoComplete="new-password"
                className={inputClass}
                disabled={isSubmitting}
                placeholder={isEdit ? "Leave blank to keep current" : undefined}
                {...register("confirmPassword")}
              />
            </Field>
            <Field
              label="Access PIN"
              required={!isEdit}
              error={errors.accessPin?.message}
            >
              <Input
                type="password"
                inputMode="numeric"
                autoComplete="off"
                maxLength={4}
                placeholder={isEdit ? "Leave blank to keep current" : "4-digit code"}
                className={cn(inputClass, "max-w-[140px] tracking-[0.3em]")}
                disabled={isSubmitting}
                {...register("accessPin")}
              />
            </Field>
            <Field label="Role" required error={errors.roleId?.message}>
              <Select
                value={roleId || "none"}
                onValueChange={(v) => setValue("roleId", v === "none" ? "" : (v ?? ""))}
                disabled={isSubmitting || rolesLoading}
              >
                <SelectTrigger className={cn("w-full", inputClass)}>
                  <SelectValue placeholder={rolesLoading ? "Loading…" : "Select role"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none" disabled>
                    {rolesLoading ? "Loading…" : "Select role"}
                  </SelectItem>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={String(role.id)}>
                      {role.roleName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Access locations">
              <Input
                className={inputClass}
                placeholder="e.g. Main Store"
                disabled={isSubmitting}
                {...register("accessLocations")}
              />
            </Field>
          </FieldGrid>
          <div className="flex flex-wrap gap-6 pt-1">
            <CheckboxField
              id="allLocations"
              label="All locations"
              checked={allLocations}
              onCheckedChange={(v) => setValue("allLocations", v)}
              disabled={isSubmitting}
            />
            <CheckboxField
              id="locationSuperadmin"
              label="superadmin"
              checked={locationSuperadmin}
              onCheckedChange={(v) => setValue("locationSuperadmin", v)}
              disabled={isSubmitting}
            />
          </div>
        </FormSection>

        <FormSection title="Sales">
          <FieldGrid cols={3}>
            <Field label="Sales commission percentage (%)">
              <Input
                type="number"
                min={0}
                max={100}
                step="0.01"
                className={inputClass}
                disabled={isSubmitting}
                {...register("salesCommissionPercent")}
              />
            </Field>
            <Field label="Max sales discount percent">
              <Input
                type="number"
                min={0}
                max={100}
                step="0.01"
                className={inputClass}
                disabled={isSubmitting}
                {...register("maxSalesDiscountPercent")}
              />
            </Field>
            <div className="flex items-end pb-0.5">
              <CheckboxField
                id="allowSelectedContacts"
                label="Allow selected contacts"
                checked={allowSelectedContacts}
                onCheckedChange={(v) => setValue("allowSelectedContacts", v)}
                disabled={isSubmitting}
              />
            </div>
          </FieldGrid>
        </FormSection>

        <FormSection title="More information">
          <FieldGrid>
            <Field label="Date of birth">
              <Input type="date" className={inputClass} disabled={isSubmitting} {...register("dateOfBirth")} />
            </Field>
            <Field label="Gender">
              <Select
                value={gender || "none"}
                onValueChange={(v) => setValue("gender", v === "none" ? "" : (v ?? ""))}
              >
                <SelectTrigger className={cn("w-full", inputClass)}>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">—</SelectItem>
                  {GENDER_OPTIONS.filter(Boolean).map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Marital status">
              <Select
                value={maritalStatus || "none"}
                onValueChange={(v) => setValue("maritalStatus", v === "none" ? "" : (v ?? ""))}
              >
                <SelectTrigger className={cn("w-full", inputClass)}>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">—</SelectItem>
                  {MARITAL_STATUS_OPTIONS.filter(Boolean).map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Blood group">
              <Select
                value={bloodGroup || "none"}
                onValueChange={(v) => setValue("bloodGroup", v === "none" ? "" : (v ?? ""))}
              >
                <SelectTrigger className={cn("w-full", inputClass)}>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">—</SelectItem>
                  {BLOOD_GROUP_OPTIONS.filter(Boolean).map((b) => (
                    <SelectItem key={b} value={b}>
                      {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Mobile number">
              <Input type="tel" className={inputClass} disabled={isSubmitting} {...register("mobileNumber")} />
            </Field>
            <Field label="Alternate contact number">
              <Input type="tel" className={inputClass} disabled={isSubmitting} {...register("alternateContactNumber")} />
            </Field>
            <Field label="Family contact number">
              <Input type="tel" className={inputClass} disabled={isSubmitting} {...register("familyContactNumber")} />
            </Field>
            <Field label="Facebook link">
              <Input type="url" className={inputClass} disabled={isSubmitting} {...register("facebookLink")} />
            </Field>
            <Field label="Twitter link">
              <Input type="url" className={inputClass} disabled={isSubmitting} {...register("twitterLink")} />
            </Field>
            <Field label="Social media 1">
              <Input className={inputClass} disabled={isSubmitting} {...register("socialMedia1")} />
            </Field>
            <Field label="Social media 2">
              <Input className={inputClass} disabled={isSubmitting} {...register("socialMedia2")} />
            </Field>
            <Field label="Custom field 1">
              <Input className={inputClass} disabled={isSubmitting} {...register("customField1")} />
            </Field>
            <Field label="Custom field 2">
              <Input className={inputClass} disabled={isSubmitting} {...register("customField2")} />
            </Field>
            <Field label="Custom field 3">
              <Input className={inputClass} disabled={isSubmitting} {...register("customField3")} />
            </Field>
            <Field label="Custom field 4">
              <Input className={inputClass} disabled={isSubmitting} {...register("customField4")} />
            </Field>
            <Field label="Guardian name">
              <Input className={inputClass} disabled={isSubmitting} {...register("guardianName")} />
            </Field>
            <Field label="ID proof name">
              <Input className={inputClass} disabled={isSubmitting} {...register("idProofName")} />
            </Field>
            <Field label="ID proof number">
              <Input className={inputClass} disabled={isSubmitting} {...register("idProofNumber")} />
            </Field>
          </FieldGrid>
          <FieldGrid cols={2}>
            <Field label="Permanent address">
              <textarea
                rows={3}
                className={cn(
                  "flex w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
                  inputClass,
                )}
                disabled={isSubmitting}
                {...register("permanentAddress")}
              />
            </Field>
            <Field label="Current address">
              <textarea
                rows={3}
                className={cn(
                  "flex w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
                  inputClass,
                )}
                disabled={isSubmitting}
                {...register("currentAddress")}
              />
            </Field>
          </FieldGrid>
        </FormSection>

        <FormSection title="Bank details">
          <FieldGrid>
            <Field label="Account holder's name">
              <Input className={inputClass} disabled={isSubmitting} {...register("accountHolderName")} />
            </Field>
            <Field label="Account number">
              <Input className={inputClass} disabled={isSubmitting} {...register("accountNumber")} />
            </Field>
            <Field label="Bank name">
              <Input className={inputClass} disabled={isSubmitting} {...register("bankName")} />
            </Field>
            <Field label="Bank identifier code">
              <Input className={inputClass} disabled={isSubmitting} {...register("bankIdentifierCode")} />
            </Field>
            <Field label="Branch">
              <Input className={inputClass} disabled={isSubmitting} {...register("branch")} />
            </Field>
            <Field label="Tax payer ID">
              <Input className={inputClass} disabled={isSubmitting} {...register("taxPayerId")} />
            </Field>
          </FieldGrid>
        </FormSection>
      </form>

      <div className="sticky bottom-0 z-10 -mx-4 mt-6 border-t border-neutral-200/90 bg-[#f4f6f9]/95 px-4 py-3 backdrop-blur-sm md:-mx-6 md:px-6 lg:-mx-8 lg:px-8">
        <div className="mx-auto flex max-w-[1600px] items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-9 border-neutral-200 bg-white"
            disabled={isSubmitting}
            onClick={() => router.push("/users")}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form={resolvedFormId}
            disabled={isSubmitting || roles.length === 0}
            className="h-9 min-w-[120px] border-0 bg-primary font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                {isEdit ? "Updating…" : "Saving…"}
              </>
            ) : isEdit ? (
              "Update user"
            ) : (
              "Save"
            )}
          </Button>
        </div>
      </div>
    </>
  );
}

/** @deprecated Use UserForm */
export const AddUserForm = UserForm;
