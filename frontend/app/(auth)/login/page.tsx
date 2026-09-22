"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, BadgeCheck, ShieldCheck } from "lucide-react";
import { loginSchema, type LoginFormData } from "@/lib/validation/authSchemas";
import { authApi } from "@/services";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { AuthFooter, FooterLink } from "@/components/auth/AuthFooter";
import { DotPattern } from "@/components/auth/DotPattern";
import { PasswordField } from "@/components/auth/PasswordField";
import { Checkbox } from "@/components/auth/Checkbox";
import SocialLogin from "@/components/auth/SocialLogin";
import { WorkspacePreview } from "@/components/auth/WorkspacePreview";
import { Button, Input } from "@/components/ui";
import { useShake } from "@/hooks/useShake";

function LiveSyncPill() {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-400">
      <span className="relative flex size-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
      </span>
      v2.4 Live Sync
    </span>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);
  const { shake } = useShake();

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
        shake();
      }
    },
    [queryClient, router, shake]
  );

  return (
    <>
      <AuthHeader
        right={
          <>
            <Link
              href="/help"
              className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:block"
            >
              Help Center
            </Link>
            <span className="hidden h-4 w-px bg-border sm:block" />
            <span className="hidden text-sm text-muted-foreground lg:block">
              Need an account?
            </span>
            <Button
              size="sm"
              className="rounded-lg"
              onClick={() => router.push("/signup")}
            >
              Create account
            </Button>
          </>
        }
      />

      <main className="flex flex-1 flex-col lg:flex-row">
        <section className="relative flex items-center justify-center overflow-hidden px-6 py-12 lg:flex-1 lg:py-16">
          <DotPattern className="opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
          <div className="relative z-10 w-full max-w-[400px]">
            <div className="mb-6 flex flex-wrap items-center gap-2">
              <LiveSyncPill />
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
                <ShieldCheck className="size-3.5 text-emerald-500" aria-hidden="true" />
                End-to-End Encrypted
              </span>
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              Welcome back
            </h1>
            <p className="mt-2 text-base text-muted-foreground">
              Sign in to continue to SplitEase
            </p>

            <form
              onSubmit={handleSubmit(onSubmit, () => shake())}
              noValidate
              className="mt-8 space-y-4"
            >
              {serverError && (
                <div
                  className="rounded-lg bg-danger-muted border border-danger/20 px-4 py-3 text-sm text-danger"
                  role="alert"
                >
                  {serverError}
                </div>
              )}

              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                className="h-11"
                error={errors.email?.message}
                {...register("email")}
              />

              <PasswordField
                label="Password"
                placeholder="Enter your password"
                autoComplete="current-password"
                error={errors.password?.message}
                rightLabel={
                  <Link
                    href="/forgot-password"
                    className="text-sm text-foreground transition-opacity hover:opacity-70"
                  >
                    Forgot password?
                  </Link>
                }
                {...register("password")}
              />

              <label className="flex cursor-pointer items-center gap-2.5 text-sm text-muted-foreground">
                <Checkbox defaultChecked />
                <span>Remember this device for 30 days</span>
              </label>

              <Button
                type="submit"
                fullWidth
                size="lg"
                loading={isSubmitting}
                icon={<ArrowRight />}
                iconPosition="right"
                className="rounded-lg"
              >
                Sign in
              </Button>
            </form>

            <div className="my-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs text-muted-foreground">
                  <span className="bg-background px-3">Or continue with</span>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <SocialLogin variant="split" />
            </div>

            <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
              <BadgeCheck className="size-3.5" aria-hidden="true" />
              Trusted by 1M+ users · SOC-2 Type II
            </p>
          </div>
        </section>

        <aside className="hidden w-full border-l border-border bg-zinc-50/75 dark:bg-zinc-900/40 lg:block lg:w-[480px] xl:w-[520px]">
          <WorkspacePreview variant="home" />
        </aside>
      </main>

      <AuthFooter
        left={
          <span>
            SplitEase <span aria-hidden="true">•</span> © 2025
          </span>
        }
        right={
          <>
            <FooterLink href="/privacy">Privacy Policy</FooterLink>
            <FooterLink href="/terms">Terms of Service</FooterLink>
            <FooterLink href="/security">Security</FooterLink>
            <FooterLink href="/help">Help Center</FooterLink>
          </>
        }
      />
    </>
  );
}