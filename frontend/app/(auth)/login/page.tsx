"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { loginSchema, type LoginFormData } from "@/lib/validation/authSchemas";
import { authApi } from "@/services";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import SocialLogin from "@/components/auth/SocialLogin";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/primitives/accordion";
import { Button } from "@/components/ui/primitives/button";
import { Input } from "@/components/ui/primitives/input";
import { Label } from "@/components/ui/primitives/label";

export default function LoginPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
  });

  const onSubmit = useCallback(
    async (data: LoginFormData) => {
      setServerError(null);
      try {
        const res = await authApi.login({
          email: data.email,
          password: data.password,
        });
        localStorage.setItem("token", res.data.token);
        queryClient.setQueryData(queryKeys.auth.me(), res.data.user);
        router.push("/dashboard");
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Login failed. Please try again.";
        setServerError(message);
      }
    },
    [queryClient, router]
  );

  return (
    <>
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-lg lg:text-xl mb-4">Welcome back</h1>
        <p className="font-sans text-sm text-[#878787]">
          Sign in to continue to SplitEase
        </p>
      </div>

      {/* Sign In Options */}
      <div className="space-y-3 flex items-center justify-center w-full">
        <SocialLogin />
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-background font-sans text-[#878787]">
            or
          </span>
        </div>
      </div>

      {/* More Options Accordion */}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1" className="border-0">
          <AccordionTrigger className="w-full bg-[#0e0e0e] border border-[#0e0e0e] text-white font-sans text-sm h-11 px-4 hover:bg-[#1a1a1a] dark:bg-[#131313] dark:border-border dark:text-foreground dark:hover:bg-border/50 transition-colors rounded-lg flex items-center justify-center hover:no-underline [&_svg]:hidden">
            <span className="text-white dark:text-foreground">
              Show other options
            </span>
          </AccordionTrigger>
          <AccordionContent className="pt-4">
            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="flex flex-col space-y-4"
            >
              {serverError && (
                <div
                  className="bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive"
                  role="alert"
                >
                  {serverError}
                </div>
              )}

              <div className="flex flex-col space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  aria-invalid={errors.email ? true : undefined}
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-xs text-destructive" role="alert">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="login-password">Password</Label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-foreground hover:opacity-70 transition-opacity"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  aria-invalid={errors.password ? true : undefined}
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-xs text-destructive" role="alert">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary px-6 h-11 text-primary-foreground font-sans"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin shrink-0" size={16} />
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>

            <p className="text-sm text-muted-foreground text-center mt-4">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="text-foreground hover:opacity-70 transition-opacity"
              >
                Create account
              </Link>
            </p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Terms and Privacy Policy - Bottom aligned */}
      <div className="text-center mt-auto">
        <p className="font-sans text-xs text-[#878787]">
          By signing in you agree to our{" "}
          <Link
            href="/terms"
            className="text-[#878787] hover:text-foreground transition-colors underline"
          >
            Terms of service
          </Link>{" "}
          &{" "}
          <Link
            href="/privacy"
            className="text-[#878787] hover:text-foreground transition-colors underline"
          >
            Privacy policy
          </Link>
        </p>
      </div>
    </>
  );
}
