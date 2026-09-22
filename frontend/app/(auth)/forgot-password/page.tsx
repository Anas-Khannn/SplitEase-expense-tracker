"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle2, KeyRound, Lock } from "lucide-react";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from "@/lib/validation/authSchemas";
import { SplitEaseLogo } from "@/components/auth/SplitEaseLogo";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { AuthFooter, FooterLink } from "@/components/auth/AuthFooter";
import { GridPattern } from "@/components/auth/DotPattern";
import AuthMethodToggle from "@/components/auth/AuthMethodToggle";
import { Button, Input } from "@/components/ui";
import { useShake } from "@/hooks/useShake";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [method, setMethod] = useState<"email" | "phone">("email");
  const [submitted, setSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [serverError, setServerError] = useState<string | null>(null);
  const { shake } = useShake();

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
    <>
      <AuthHeader
        left={
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to login
          </Link>
        }
        center={<SplitEaseLogo variant="tile" />}
        right={
          <Link
            href="/help"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Help & FAQ
          </Link>
        }
      />

      <main className="relative flex flex-1 items-center justify-center overflow-hidden bg-zinc-50 px-6 py-12 dark:bg-zinc-900/40">
        <GridPattern className="opacity-60" />
        <div className="relative z-10 w-full max-w-[400px] rounded-xl border border-border bg-background p-8 shadow-sm">
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
                <CheckCircle2 size={48} className="mx-auto mb-4 text-success" />
                <h2 className="text-2xl font-bold tracking-tight text-foreground mb-2">
                  Check your email
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  We&apos;ve sent a password reset link to{" "}
                  <span className="font-medium text-foreground">
                    {submittedEmail}
                  </span>
                  . Please check your inbox.
                </p>
                <Button
                  fullWidth
                  className="rounded-lg"
                  onClick={() => router.push("/login")}
                >
                  Back to login
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

                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  Reset password
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  We&apos;ll email you a link to reset your password
                </p>

                <form
                  onSubmit={handleSubmit(onSubmit, () => shake())}
                  noValidate
                  className="mt-6 space-y-4"
                >
                  {serverError && (
                    <div
                      className="rounded-lg bg-danger-muted border border-danger/20 px-4 py-3 text-sm text-danger"
                      role="alert"
                    >
                      {serverError}
                    </div>
                  )}

                  <AuthMethodToggle
                    value={method}
                    onChange={handleMethodChange}
                    disabled={isSubmitting}
                  />

                  <input type="hidden" {...register("method")} value={method} />

                  {method === "email" ? (
                    <div key="email">
                      <Input
                        label="Email address"
                        type="email"
                        placeholder="you@example.com"
                        autoComplete="email"
                        className="h-11"
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
                        className="h-11"
                        error={errors.phone?.message}
                        {...register("phone")}
                      />
                    </div>
                  )}

                  <Button
                    type="submit"
                    fullWidth
                    size="lg"
                    loading={isSubmitting}
                    icon={<ArrowRight />}
                    iconPosition="right"
                    className="rounded-lg"
                  >
                    {method === "email" ? "Send reset link" : "Send OTP"}
                  </Button>
                </form>

                <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
                  <Lock className="size-3.5 shrink-0" aria-hidden="true" />
                  <span>Secured with end-to-end encryption</span>
                </div>

                <div className="mt-4 flex justify-center">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <ArrowLeft className="size-4" aria-hidden="true" />
                    Back to login
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <AuthFooter
        center={<span>© 2024 SplitEase Inc.</span>}
        right={
          <>
            <FooterLink href="/privacy">Privacy</FooterLink>
            <FooterLink href="/terms">Terms of Service</FooterLink>
            <FooterLink href="/security">Security</FooterLink>
            <FooterLink href="/security">Status</FooterLink>
            <FooterLink href="/help">Support</FooterLink>
          </>
        }
      />
    </>
  );
}