import { z } from "zod";

export const profileEditSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string(),
  email: z.string().email("Enter a valid email"),
  mobileNumber: z.string(),
  username: z.string(),
});

export type ProfileEditValues = z.infer<typeof profileEditSchema>;

export const profilePasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ProfilePasswordValues = z.infer<typeof profilePasswordSchema>;
