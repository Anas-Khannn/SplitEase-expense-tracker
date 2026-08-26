"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  signupSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/lib/validation/authSchemas";
import type { z } from "zod";

type AuthFormType = "signup" | "login" | "forgotPassword" | "resetPassword";

const schemaMap = {
  signup: signupSchema,
  login: loginSchema,
  forgotPassword: forgotPasswordSchema,
  resetPassword: resetPasswordSchema,
} as const;

export function useAuthForm(type: AuthFormType) {
  const schema = schemaMap[type];

  const form = useForm<z.output<typeof schema>>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: {},
  });

  return {
    ...form,
  };
}
