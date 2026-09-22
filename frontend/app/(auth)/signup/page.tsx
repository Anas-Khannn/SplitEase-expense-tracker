"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "lucide-react";
import { signupSchema, type SignupFormData } from "@/lib/validation/authSchemas";
import { authApi } from "@/services";
import { SplitEaseLogo } from "@/components/auth/SplitEaseLogo";
import { DotPattern } from "@/components/auth/DotPattern";
import { PasswordField } from "@/components/auth/PasswordField";
import { PasswordStrength } from "@/components/auth/PasswordStrength";
import { Checkbox } from "@/components/auth/Checkbox";
import { GoogleButton } from "@/components/auth/SocialLogin";
import { SignupShowcase } from "@/components/auth/SignupShowcase";
import { Button, Input } from "@/components/ui";
import { useShake } from "@/hooks/useShake";

export default function SignupPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const { shake } = useShake();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: "onTouched",
  });

  const password = useWatch({ control, name: "password" }) ?? "";

  const onSubmit = useCallback(
    async (data: SignupFormData) => {
      setServerError(null);
      try {
        await authApi.signup({
          name: data.name,
          email: data.email,
          password: data.password,
        });
        router.push("/login");
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Signup failed. Please try again.";
        setServerError(message);
        shake();
      }
    },
    [router, shake]
  );

  return (
    <main className="relative flex flex-1 flex-col bg-background lg:flex-row">
      <section className="relative flex flex-col px-6 py-8 sm:px-10 lg:w-[min(60%,980px)] lg:px-16 lg:py-10">
        <div className="flex items-center justify-between">
          <SplitEaseLogo variant="tile" />
          <Link
            href="/help"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Help & Support
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-[420px]">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              Create your account
            </h1>
            <p className="mt-2 text-base text-muted-foreground">
              Start splitting expenses effortlessly
            </p>

            <div className="mt-8">
              <GoogleButton className="w-full" />
            </div>

            <div className="my-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs text-muted-foreground">
                  <span className="bg-background px-3">OR CONTINUE WITH</span>
                </div>
              </div>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit, () => shake())}
              noValidate
              className="space-y-4"
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
                label="Full name"
                type="text"
                placeholder="Your name"
                autoComplete="name"
                className="h-11"
                error={errors.name?.message}
                {...register("name")}
              />

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
                placeholder="Min. 8 characters"
                autoComplete="new-password"
                error={errors.password?.message}
                {...register("password")}
              />
              <PasswordStrength password={password} className="-mt-1" />

              <PasswordField
                label="Confirm password"
                placeholder="Re-enter your password"
                autoComplete="new-password"
                error={errors.confirmPassword?.message}
                {...register("confirmPassword")}
              />

              <label className="flex cursor-pointer items-center gap-2.5 text-sm text-muted-foreground">
                <Checkbox defaultChecked />
                <span>
                  I agree to the{" "}
                  <Link
                    href="/terms"
                    className="text-foreground underline underline-offset-2"
                  >
                    Terms & Privacy Policy
                  </Link>
                </span>
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
                Create account
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-medium text-foreground transition-opacity hover:opacity-70"
                >
                  Log in
                </Link>
              </p>
            </form>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-4 text-center text-xs text-muted-foreground">
          <p>
            © 2025 SplitEase Inc.{" "}
            <span className="mx-1" aria-hidden="true">
              •
            </span>
            <a href="/privacy" className="underline underline-offset-2 hover:text-foreground">
              Privacy
            </a>
            <span className="mx-1" aria-hidden="true">
              •
            </span>
            <a href="/terms" className="underline underline-offset-2 hover:text-foreground">
              Security
            </a>
          </p>
        </div>
      </section>

      <aside className="relative hidden overflow-hidden border-l border-border bg-zinc-50 dark:bg-zinc-900/40 lg:flex lg:w-[min(40%,640px)] lg:flex-col">
        <DotPattern className="opacity-60" />
        <SignupShowcase className="relative z-10" />
      </aside>
    </main>
  );
}