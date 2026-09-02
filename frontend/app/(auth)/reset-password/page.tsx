"use client";

import { Suspense, useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import {
  resetPasswordSchema,
  type ResetPasswordFormData,
} from "@/lib/validation/authSchemas";
import OTPInput from "@/components/auth/OTPInput";
import AuthCard from "@/components/auth/AuthCard";
import { Button, Input } from "@/components/ui";
import { useShake } from "@/hooks/useShake";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

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
        // TODO: POST /api/auth/reset-password with { token/otp, newPassword }
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
                className="mx-auto mb-4 text-success-500"
              />
              <h2 className="text-h2 font-bold text-text-primary mb-2">
                Password reset successful
              </h2>
              <p className="text-body-sm text-text-muted mb-6">
                Your password has been updated. Redirecting to login...
              </p>
              <Link href="/login">
                <Button variant="primary" fullWidth icon={<ArrowRight />} iconPosition="right">
                  Go to login
                </Button>
              </Link>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0 }}
              variants={containerVariants}
            >
              <motion.div variants={itemVariants}>
                <Link
                  href="/forgot-password"
                  className="inline-flex items-center gap-1 text-body-sm text-text-muted hover:text-text-primary transition-colors mb-5"
                >
                  <ArrowLeft size={14} />
                  Back to forgot password
                </Link>
              </motion.div>

              <motion.div variants={itemVariants}>
                <h2 className="text-h2 font-bold text-text-primary mb-1.5">
                  {isTokenFlow
                    ? "Set new password"
                    : otpVerified
                      ? "Set new password"
                      : "Enter verification code"}
                </h2>
                <p className="text-body-sm text-text-muted mb-6">
                  {isTokenFlow
                    ? "Choose a strong new password for your account."
                    : otpVerified
                      ? "Choose a strong new password for your account."
                      : `Enter the 6-digit code sent to ${phone}`}
                </p>
              </motion.div>

              {isOTPFlow && !otpVerified && (
                <motion.div variants={itemVariants} className="mb-6">
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
                      className="text-body-sm text-primary-500 hover:text-primary-600 transition-colors disabled:text-text-muted disabled:cursor-not-allowed"
                    >
                      {cooldown > 0
                        ? `Resend code in ${cooldown}s`
                        : "Resend code"}
                    </button>
                  </div>
                </motion.div>
              )}

              {showNewPassword && (
                <motion.div
                  key="new-password"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.form
                    onSubmit={handleSubmit(onSubmit, () => shake())}
                    animate={shakeControls}
                    noValidate
                  >
                    <div className="flex flex-col gap-4">
                      {serverError && (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="rounded-radius-md bg-danger-100 border border-danger-500/20 px-4 py-3 text-body-sm text-danger-500"
                          role="alert"
                        >
                          {serverError}
                        </motion.div>
                      )}

                      {isOTPFlow && (
                        <input type="hidden" {...register("otp")} value={otp} />
                      )}

                      <motion.div variants={itemVariants}>
                        <Input
                          label="New password"
                          type="password"
                          placeholder="Min. 8 characters"
                          autoComplete="new-password"
                          error={errors.newPassword?.message}
                          {...register("newPassword")}
                        />
                      </motion.div>

                      <motion.div variants={itemVariants}>
                        <Input
                          label="Confirm new password"
                          type="password"
                          placeholder="Re-enter your password"
                          autoComplete="new-password"
                          error={errors.confirmPassword?.message}
                          {...register("confirmPassword")}
                        />
                      </motion.div>

                      <motion.div variants={itemVariants}>
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
                      </motion.div>
                    </div>
                  </motion.form>
                </motion.div>
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
          <div className="animate-pulse text-text-muted text-body-sm">Loading...</div>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
