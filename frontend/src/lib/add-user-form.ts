import { z } from "zod";

export const PREFIX_OPTIONS = ["", "Mr", "Mrs", "Ms", "Miss", "Dr", "Prof"] as const;

export const GENDER_OPTIONS = ["", "Male", "Female", "Other", "Prefer not to say"] as const;

export const MARITAL_STATUS_OPTIONS = [
  "",
  "Single",
  "Married",
  "Divorced",
  "Widowed",
] as const;

export const BLOOD_GROUP_OPTIONS = [
  "",
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
] as const;

export const ACCESS_LOCATION_OPTIONS = ["superadmin", "Main Store", "Warehouse"] as const;

const userFormFieldsSchema = z.object({
    prefix: z.string(),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string(),
    email: z.email("Enter a valid email"),
    isActive: z.boolean(),
    allowLogin: z.boolean(),
    username: z.string(),
    password: z.string(),
    confirmPassword: z.string(),
    accessPin: z.string(),
    roleId: z.string().min(1, "Role is required"),
    accessLocations: z.string(),
    allLocations: z.boolean(),
    locationSuperadmin: z.boolean(),
    salesCommissionPercent: z.string(),
    maxSalesDiscountPercent: z.string(),
    allowSelectedContacts: z.boolean(),
    dateOfBirth: z.string(),
    gender: z.string(),
    maritalStatus: z.string(),
    bloodGroup: z.string(),
    mobileNumber: z.string(),
    alternateContactNumber: z.string(),
    familyContactNumber: z.string(),
    facebookLink: z.string(),
    twitterLink: z.string(),
    socialMedia1: z.string(),
    socialMedia2: z.string(),
    customField1: z.string(),
    customField2: z.string(),
    customField3: z.string(),
    customField4: z.string(),
    guardianName: z.string(),
    idProofName: z.string(),
    idProofNumber: z.string(),
    permanentAddress: z.string(),
    currentAddress: z.string(),
    accountHolderName: z.string(),
    accountNumber: z.string(),
    bankName: z.string(),
    bankIdentifierCode: z.string(),
    branch: z.string(),
    taxPayerId: z.string(),
});

const accessPinField = z
  .string()
  .trim()
  .regex(/^\d{4}$/, "Access PIN must be exactly 4 digits");

export const addUserFormSchema = userFormFieldsSchema
  .extend({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm your password"),
    accessPin: accessPinField,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const editUserFormSchema = userFormFieldsSchema
  .refine(
    (data) => {
      const pin = data.accessPin.trim();
      if (!pin) return true;
      return /^\d{4}$/.test(pin);
    },
    { message: "Access PIN must be exactly 4 digits", path: ["accessPin"] },
  )
  .refine(
    (data) => {
      const pw = data.password.trim();
      const confirm = data.confirmPassword.trim();
      if (!pw && !confirm) return true;
      return pw.length >= 8 && pw === confirm;
    },
    {
      message: "Password must be at least 8 characters and match confirmation",
      path: ["confirmPassword"],
    },
  )
  .refine(
    (data) => {
      const pw = data.password.trim();
      if (!pw) return true;
      return data.confirmPassword.trim().length > 0;
    },
    { message: "Confirm your password", path: ["confirmPassword"] },
  );

export type UserFormValues = z.infer<typeof userFormFieldsSchema>;
export type AddUserFormValues = UserFormValues;

export const USER_FORM_DEFAULT_VALUES: UserFormValues = {
  prefix: "",
  firstName: "",
  lastName: "",
  email: "",
  isActive: true,
  allowLogin: true,
  username: "",
  password: "",
  confirmPassword: "",
  accessPin: "",
  roleId: "",
  accessLocations: "",
  allLocations: false,
  locationSuperadmin: false,
  salesCommissionPercent: "",
  maxSalesDiscountPercent: "",
  allowSelectedContacts: false,
  dateOfBirth: "",
  gender: "",
  maritalStatus: "",
  bloodGroup: "",
  mobileNumber: "",
  alternateContactNumber: "",
  familyContactNumber: "",
  facebookLink: "",
  twitterLink: "",
  socialMedia1: "",
  socialMedia2: "",
  customField1: "",
  customField2: "",
  customField3: "",
  customField4: "",
  guardianName: "",
  idProofName: "",
  idProofNumber: "",
  permanentAddress: "",
  currentAddress: "",
  accountHolderName: "",
  accountNumber: "",
  bankName: "",
  bankIdentifierCode: "",
  branch: "",
  taxPayerId: "",
};

/** @deprecated Use USER_FORM_DEFAULT_VALUES */
export const ADD_USER_DEFAULT_VALUES = USER_FORM_DEFAULT_VALUES;

export function parseFullName(fullName: string): Pick<UserFormValues, "prefix" | "firstName" | "lastName"> {
  const prefixes = PREFIX_OPTIONS.filter(Boolean);
  let rest = fullName.trim();
  let prefix = "";
  for (const p of prefixes) {
    if (rest.toLowerCase().startsWith(`${p.toLowerCase()} `)) {
      prefix = p;
      rest = rest.slice(p.length).trim();
      break;
    }
  }
  const parts = rest.split(/\s+/).filter(Boolean);
  return {
    prefix,
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" "),
  };
}

export function buildFullName(values: Pick<UserFormValues, "prefix" | "firstName" | "lastName">) {
  return [values.prefix, values.firstName, values.lastName]
    .map((s) => s.trim())
    .filter(Boolean)
    .join(" ");
}

export function resolvePhone(values: UserFormValues): string | null {
  const phone =
    values.mobileNumber.trim() ||
    values.alternateContactNumber.trim() ||
    values.familyContactNumber.trim();
  return phone || null;
}

export function mapUserToFormValues(
  user: { fullName: string; email: string; phone: string | null; accessPin?: string | null },
  extras?: Partial<UserFormValues> | null,
  defaultRoleId = "",
): UserFormValues {
  const parsed = parseFullName(user.fullName);
  return {
    ...USER_FORM_DEFAULT_VALUES,
    ...extras,
    ...parsed,
    email: user.email,
    mobileNumber: user.phone ?? extras?.mobileNumber ?? "",
    username: extras?.username?.trim() ? extras.username : user.email,
    accessPin: user.accessPin ?? extras?.accessPin ?? "",
    roleId: extras?.roleId ?? defaultRoleId,
    isActive: extras?.isActive ?? true,
    allowLogin: extras?.allowLogin ?? true,
    password: "",
    confirmPassword: "",
  };
}
