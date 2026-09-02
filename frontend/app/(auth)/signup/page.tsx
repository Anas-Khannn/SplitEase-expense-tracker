"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "lucide-react";
import { signupSchema, type SignupFormData } from "@/lib/validation/authSchemas";
import { authApi } from "@/services";
import AuthCard from "@/components/auth/AuthCard";
import SocialLogin from "@/components/auth/SocialLogin";
import { Button, Input } from "@/components/ui";
import { useShake } from "@/hooks/useShake";

export default function SignupPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const { shakeControls, shake } = useShake();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: "onTouched",
  });

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
    <AuthCard screenKey="signup" className="w-full">
      <div className="px-6 py-8 sm:px-8">
        <div>
          <div>
            <h2 className="text-4xl text-foreground mb-1.5">
              Create your account
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Start splitting expenses with friends
            </p>
          </div>

          <div className="mb-6">
            <SocialLogin />
          </div>

          <div className="mb-5">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs text-muted-foreground">
                <span className="bg-background px-3">or continue with email</span>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit, () => shake())}
            noValidate
          >
            <div className="flex flex-col gap-4">
              {serverError && (
                <div
                  className="bg-danger-muted border border-danger/20 px-4 py-3 text-sm text-danger"
                  role="alert"
                >
                  {serverError}
                </div>
              )}

              <div>
                <Input
                  label="Full name"
                  type="text"
                  placeholder="Your name"
                  autoComplete="name"
                  error={errors.name?.message}
                  {...register("name")}
                />
              </div>

              <div>
                <Input
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  error={errors.email?.message}
                  {...register("email")}
                />
              </div>

              <div>
                <Input
                  label="Password"
                  type="password"
                  placeholder="Min. 8 characters"
                  autoComplete="new-password"
                  error={errors.password?.message}
                  {...register("password")}
                />
              </div>

              <div>
                <Input
                  label="Confirm password"
                  type="password"
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  error={errors.confirmPassword?.message}
                  {...register("confirmPassword")}
                />
              </div>

              <div>
                <Button
                  type="submit"
                  fullWidth
                  size="lg"
                  loading={isSubmitting}
                  icon={<ArrowRight />}
                  iconPosition="right"
                >
                  Create account
                </Button>
              </div>

              <p className="text-sm text-muted-foreground text-center mt-1">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-foreground hover:opacity-70 transition-opacity"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </AuthCard>
  );
}
