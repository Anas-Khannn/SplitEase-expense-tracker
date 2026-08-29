"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from "@/lib/validation/authSchemas";
import AuthCard from "@/components/auth/AuthCard";
import AuthMethodToggle from "@/components/auth/AuthMethodToggle";
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

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [method, setMethod] = useState<"email" | "phone">("email");
  const [submitted, setSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [serverError, setServerError] = useState<string | null>(null);
  const { shakeControls, shake } = useShake();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onTouched",
    defaultValues: { method: "email" },
  });

  const handleMethodChange = useCallback(
    (m: "email" | "phone") => {
      setMethod(m);
      setValue("method", m);
    },
    [setValue]
  );

  const onSubmit = useCallback(
    async (data: ForgotPasswordFormData) => {
      setServerError(null);
      try {
        // TODO: POST /api/auth/forgot-password (backend endpoint not implemented yet)
        // For now, simulate success for email flow
        if (data.method === "email" && data.email) {
          setSubmittedEmail(data.email);
          setSubmitted(true);
        } else if (data.method === "phone" && data.phone) {
          // TODO: POST /api/auth/forgot-password with phone
          // Navigate to OTP entry
          router.push(`/reset-password?phone=${encodeURIComponent(data.phone)}`);
        }
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : "Request failed. Please try again.";
        setServerError(message);
        shake();
      }
    },
    [router, shake]
  );

  return (
    <AuthCard screenKey="forgotPassword" className="w-full">
      <div className="px-6 py-8 sm:px-8">
        <AnimatePresence mode="wait">
          {submitted ? (
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
                Check your email
              </h2>
              <p className="text-body-sm text-text-muted mb-6">
                We&apos;ve sent a password reset link to{" "}
                <span className="font-medium text-text-primary">
                  {submittedEmail}
                </span>
                . Please check your inbox.
              </p>
              <Link
                href="/login"
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-radius-md border border-border-default bg-surface px-4 text-button font-semibold text-text-primary transition-colors duration-150 hover:bg-surface-alt focus-visible:outline-2 focus-visible:outline-offset-2 [&>svg]:size-[1em]"
              >
                <ArrowLeft aria-hidden="true" />
                Back to login
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
                  href="/login"
                  className="inline-flex items-center gap-1 text-body-sm text-text-muted hover:text-text-primary transition-colors mb-5"
                >
                  <ArrowLeft size={14} />
                  Back to login
                </Link>
              </motion.div>

              <motion.div variants={itemVariants}>
                <h2 className="text-h2 font-bold text-text-primary mb-1.5">
                  Reset your password
                </h2>
                <p className="text-body-sm text-text-muted mb-6">
                  Choose how you&apos;d like to reset your password
                </p>
              </motion.div>

              <motion.div variants={itemVariants} className="mb-5">
                <AuthMethodToggle
                  value={method}
                  onChange={handleMethodChange}
                  disabled={isSubmitting}
                />
              </motion.div>

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

                  <input type="hidden" {...register("method")} value={method} />

                  {method === "email" ? (
                    <motion.div
                      key="email"
                      variants={itemVariants}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Input
                        label="Email address"
                        type="email"
                        placeholder="you@example.com"
                        autoComplete="email"
                        error={errors.email?.message}
                        {...register("email")}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="phone"
                      variants={itemVariants}
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Input
                        label="Phone number"
                        type="tel"
                        placeholder="+14155552671"
                        autoComplete="tel"
                        error={errors.phone?.message}
                        {...register("phone")}
                      />
                    </motion.div>
                  )}

                  <motion.div variants={itemVariants}>
                    <Button
                      type="submit"
                      fullWidth
                      size="lg"
                      loading={isSubmitting}
                      icon={<ArrowRight />}
                      iconPosition="right"
                    >
                      {method === "email" ? "Send reset link" : "Send OTP"}
                    </Button>
                  </motion.div>
                </div>
              </motion.form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AuthCard>
  );
}
