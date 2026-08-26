import { z } from "zod";
import { parsePhoneNumberFromString } from "libphonenumber-js";

const emailField = z
  .string()
  .min(1, "Email is required")
  .email("Please enter a valid email address");

const passwordField = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/\d/, "Password must contain at least one number");

const phoneField = z
  .string()
  .min(1, "Phone number is required")
  .refine((val) => {
    const parsed = parsePhoneNumberFromString(val);
    return parsed?.isValid() === true;
  }, "Please enter a valid phone number in E.164 format (e.g. +14155552671)");

const otpField = z
  .string()
  .length(6, "OTP must be exactly 6 digits")
  .regex(/^\d{6}$/, "OTP must contain only digits");

export const signupSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: emailField,
    password: passwordField,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z
  .object({
    method: z.enum(["email", "phone"]),
    email: emailField.optional(),
    phone: phoneField.optional(),
  })
  .refine(
    (data) => {
      if (data.method === "email") return !!data.email;
      if (data.method === "phone") return !!data.phone;
      return false;
    },
    {
      message: "Please provide the required contact information",
    }
  );

export const resetPasswordSchema = z
  .object({
    otp: otpField.optional(),
    newPassword: passwordField,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type SignupFormData = z.output<typeof signupSchema>;
export type LoginFormData = z.output<typeof loginSchema>;
export type ForgotPasswordFormData = z.output<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.output<typeof resetPasswordSchema>;
