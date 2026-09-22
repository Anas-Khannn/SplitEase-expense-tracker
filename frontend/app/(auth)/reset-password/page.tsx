"use client";

import { Suspense, useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle2, KeyRound, Lock } from "lucide-react";
import {
  resetPasswordSchema,
  type ResetPasswordFormData,
} from "@/lib/validation/authSchemas";
import OTPInput from "@/components/auth/OTPInput";
import { SplitEaseLogo } from "@/components/auth/SplitEaseLogo";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { AuthFooter, FooterLink } from "@/components/auth/AuthFooter";
import { PasswordField } from "@/components/auth/PasswordField";
import {
  PasswordStrength,
  PasswordRequirements,
  SecurityNotice,
} from "@/components/auth/PasswordStrength";
import { WorkspacePreview } from "@/components/auth/WorkspacePreview";
import { Button } from "@/components/ui";
import { useShake } from "@/hooks/useShake";

const RESEND_COOLDOWN = 30;

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const phone = searchParams.get("phone");

  const isTokenFlow = !!token;
  const isOTPFlow = !!phone && !token;

  const [otp, setOtp] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const { shake } = useShake();

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResendOTP = useCallback(() => {
    setCooldown(RESEND_COOLDOWN);
    setOtp("");
    setOtpVerified(false);
    setOtpError(null);
  }, []);

  const handleOTPComplete = useCallback(
    async (value: string) => {
      setOtp(value);
      if (value.length === 6) {
        try {
          setOtpVerified(true);
          setOtpError(null);
        } catch {
          setOtpError("Invalid OTP. Please try again.");
          setOtpVerified(false);
        }
      }
    },
    []
  );

  const showNewPassword = isTokenFlow || otpVerified;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onTouched",
  });

  const newPassword = useWatch({ control, name: "newPassword" }) ?? "";
  const confirmPassword = useWatch({ control, name: "confirmPassword" }) ?? "";
  const passwordsMatch =
    newPassword.length > 0 && confirmPassword.length > 0 && newPassword === confirmPassword;

  const onSubmit = useCallback(
    async () => {
      setServerError(null);
      try {
        setSuccess(true);
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : "Password reset failed. Please try again.";
        setServerError(message);
        shake();
      }
    },
    [shake]
  );

  return (
    <>
      <AuthHeader
        left={
          <div className="flex items-center gap-3">
            <SplitEaseLogo variant="circles" />
            <span className="hidden items-center gap-2 rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 sm:inline-flex">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
              </span>
              v2.4 Live Sync
            </span>
          </div>
        }
        right={
          <>
            <span className="hidden text-sm text-muted-foreground lg:block">
              Need help?
            </span>
            <Button
              variant="secondary"
              size="sm"
              className="rounded-lg"
              onClick={() => router.push("/login")}
            >
              Sign In
            </Button>
          </>
        }
      />

      <main className="flex flex-1 flex-col lg:flex-row">
        <section className="flex flex-1 items-center justify-center px-6 py-12 lg:py-16">
          <div className="w-full max-w-[460px]">
            <AnimatePresence mode="wait">
              {success ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="text-center py-4"
                >
                  <CheckCircle2 size={48} className="mx-auto mb-4 text-success" />
                  <h2 className="text-3xl font-bold tracking-tight text-foreground mb-2">
                    Password reset successful
                  </h2>
                  <p className="text-sm text-muted-foreground mb-6">
                    Your password has been updated. Redirecting to login...
                  </p>
                  <Button
                    fullWidth
                    className="rounded-lg"
                    onClick={() => router.push("/login")}
                  >
                    Go to login
                    <ArrowRight aria-hidden="true" />
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="form"
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0 }}
                >
                  <div className="mb-6 inline-flex size-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <KeyRound className="size-6 text-foreground" aria-hidden="true" />
                  </div>

                  <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    {isTokenFlow || otpVerified
                      ? "Set a new password"
                      : "Enter verification code"}
                  </h1>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {isTokenFlow || otpVerified
                      ? "Choose a strong password you haven't used before."
                      : `Enter the 6-digit code sent to ${phone}`}
                  </p>

                  {isOTPFlow && !otpVerified && (
                    <div className="mt-8">
                      <OTPInput
                        value={otp}
                        onChange={handleOTPComplete}
                        error={otpError ?? undefined}
                      />
                      <div className="mt-3 text-center">
                        <button
                          type="button"
                          onClick={handleResendOTP}
                          disabled={cooldown > 0}
                          className="text-sm text-foreground hover:opacity-70 transition-opacity disabled:text-muted-foreground disabled:cursor-not-allowed"
                        >
                          {cooldown > 0
                            ? `Resend code in ${cooldown}s`
                            : "Resend code"}
                        </button>
                      </div>
                    </div>
                  )}

                  {showNewPassword && (
                    <div key="new-password" className="mt-8">
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

                        {isOTPFlow && (
                          <input type="hidden" {...register("otp")} value={otp} />
                        )}

                        <div>
                          <PasswordField
                            label="New password"
                            placeholder="Min. 8 characters"
                            autoComplete="new-password"
                            error={errors.newPassword?.message}
                            {...register("newPassword")}
                          />
                          <PasswordStrength
                            password={newPassword}
                            caption="Password strength"
                            className="mt-3"
                          />
                          <PasswordRequirements
                            password={newPassword}
                            className="mt-3"
                          />
                        </div>

                        <PasswordField
                          label="Confirm password"
                          placeholder="Re-enter your password"
                          autoComplete="new-password"
                          error={errors.confirmPassword?.message}
                          rightLabel={
                            passwordsMatch ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-400">
                                <CheckCircle2 className="size-3.5" aria-hidden="true" />
                                Passwords match
                              </span>
                            ) : undefined
                          }
                          {...register("confirmPassword")}
                        />

                        <SecurityNotice>
                          Never share your password. SplitEase support will never ask
                          for it.
                        </SecurityNotice>

                        <Button
                          type="submit"
                          fullWidth
                          size="lg"
                          loading={isSubmitting}
                          icon={<ArrowRight />}
                          iconPosition="right"
                          className="rounded-lg"
                        >
                          Reset password
                        </Button>
                      </form>
                    </div>
                  )}

                  <Link
                    href="/login"
                    className="mt-8 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <ArrowLeft className="size-4" aria-hidden="true" />
                    Back to sign in
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        <aside className="hidden w-full border-l border-border bg-zinc-50/75 dark:bg-zinc-900/40 lg:block lg:w-[480px] xl:w-[520px]">
          <WorkspacePreview variant="reset" />
        </aside>
      </main>

      <AuthFooter
        center={
          <>
            <Lock className="size-3.5" aria-hidden="true" />
            <span>Encrypted with 256-bit zero-knowledge keys.</span>
          </>
        }
        right={
          <>
            <FooterLink href="/privacy">Privacy</FooterLink>
            <FooterLink href="/terms">Terms</FooterLink>
            <FooterLink href="/security">Security</FooterLink>
            <FooterLink href="/security">Status</FooterLink>
            <span className="text-muted-foreground">© 2025</span>
          </>
        }
      />
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-8">
          <div className="animate-pulse text-muted-foreground text-sm">Loading...</div>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}