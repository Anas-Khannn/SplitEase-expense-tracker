"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from "@/lib/validation/authSchemas";
import AuthCard from "@/components/auth/AuthCard";
import AuthMethodToggle from "@/components/auth/AuthMethodToggle";
import { Button, Input } from "@/components/ui";
import { useShake } from "@/hooks/useShake";

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
        if (data.method === "email" && data.email) {
          setSubmittedEmail(data.email);
          setSubmitted(true);
        } else if (data.method === "phone" && data.phone) {
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
                className="mx-auto mb-4 text-success"
              />
              <h2 className="text-4xl text-foreground mb-2">
                Check your email
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                We&apos;ve sent a password reset link to{" "}
                <span className="text-foreground">
                  {submittedEmail}
                </span>
                . Please check your inbox.
              </p>
              <Link
                href="/login"
                className="inline-flex h-10 w-full items-center justify-center gap-2 border border-border bg-background px-4 text-sm text-foreground transition-colors duration-150 hover:bg-card focus-visible:outline-2 focus-visible:outline-offset-2 [&>svg]:size-[1em]"
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
            >
              <div>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-5"
                >
                  <ArrowLeft size={14} />
                  Back to login
                </Link>
              </div>

              <div>
                <h2 className="text-4xl text-foreground mb-1.5">
                  Reset your password
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Choose how you&apos;d like to reset your password
                </p>
              </div>

              <div className="mb-5">
                <AuthMethodToggle
                  value={method}
                  onChange={handleMethodChange}
                  disabled={isSubmitting}
                />
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

                  <input type="hidden" {...register("method")} value={method} />

                  {method === "email" ? (
                    <div key="email">
                      <Input
                        label="Email address"
                        type="email"
                        placeholder="you@example.com"
                        autoComplete="email"
                        error={errors.email?.message}
                        {...register("email")}
                      />
                    </div>
                  ) : (
                    <div key="phone">
                      <Input
                        label="Phone number"
                        type="tel"
                        placeholder="+14155552671"
                        autoComplete="tel"
                        error={errors.phone?.message}
                        {...register("phone")}
                      />
                    </div>
                  )}

                  <div>
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
                  </div>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AuthCard>
  );
}
