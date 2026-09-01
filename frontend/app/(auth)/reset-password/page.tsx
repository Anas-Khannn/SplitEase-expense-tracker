"use client";

import { Suspense, useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import {
  resetPasswordSchema,
  type ResetPasswordFormData,
} from "@/lib/validation/authSchemas";
import OTPInput from "@/components/auth/OTPInput";
import AuthCard from "@/components/auth/AuthCard";
import { Button, Input } from "@/components/ui";
import { useShake } from "@/hooks/useShake";

const RESEND_COOLDOWN = 30;

function ResetPasswordContent() {
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
  const { shakeControls, shake } = useShake();

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
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onTouched",
  });

  const onSubmit = useCallback(
    async (_data: ResetPasswordFormData) => {
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
    <AuthCard screenKey="resetPassword" className="w-full">
      <div className="px-6 py-8 sm:px-8">
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
              <CheckCircle2
                size={48}
                className="mx-auto mb-4 text-success"
              />
              <h2 className="text-4xl text-foreground mb-2">
                Password reset successful
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                Your password has been updated. Redirecting to login...
              </p>
              <Link
                href="/login"
                className="inline-flex h-10 w-full items-center justify-center gap-2 bg-foreground px-4 text-sm text-background transition-opacity duration-150 hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 [&>svg]:size-[1em]"
              >
                Go to login
                <ArrowRight aria-hidden="true" />
              </Link>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0 }}
            >
              <div>
                <Link
                  href="/forgot-password"
                  className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-5"
                >
                  <ArrowLeft size={14} />
                  Back to forgot password
                </Link>
              </div>

              <div>
                <h2 className="text-4xl text-foreground mb-1.5">
                  {isTokenFlow
                    ? "Set new password"
                    : otpVerified
                      ? "Set new password"
                      : "Enter verification code"}
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  {isTokenFlow
                    ? "Choose a strong new password for your account."
                    : otpVerified
                      ? "Choose a strong new password for your account."
                      : `Enter the 6-digit code sent to ${phone}`}
                </p>
              </div>

              {isOTPFlow && !otpVerified && (
                <div className="mb-6">
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
                <div key="new-password">
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

                      {isOTPFlow && (
                        <input type="hidden" {...register("otp")} value={otp} />
                      )}

                      <div>
                        <Input
                          label="New password"
                          type="password"
                          placeholder="Min. 8 characters"
                          autoComplete="new-password"
                          error={errors.newPassword?.message}
                          {...register("newPassword")}
                        />
                      </div>

                      <div>
                        <Input
                          label="Confirm new password"
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
                          Reset password
                        </Button>
                      </div>
                    </div>
                  </form>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AuthCard>
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
