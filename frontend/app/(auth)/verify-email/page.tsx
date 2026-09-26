"use client";

import { Suspense, useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  MailCheck,
  ShieldCheck,
} from "lucide-react";
import { authApi } from "@/services";
import { queryKeys } from "@/lib/query-keys";
import { setAuthToken } from "@/lib/auth-token";
import { ApiError } from "@/lib/api/client";
import { SplitEaseLogo } from "@/components/auth/SplitEaseLogo";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { AuthFooter, FooterLink } from "@/components/auth/AuthFooter";
import { WorkspacePreview } from "@/components/auth/WorkspacePreview";
import { Button, InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui";
import { useShake } from "@/hooks/useShake";

const RESEND_COOLDOWN = 30;
const VERIFY_EMAIL_STORAGE_KEY = "splitease:verify_email";

function VerifyEmailContent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();

  const [email] = useState<string | null>(() => {
    const fromQuery = searchParams.get("email");
    if (fromQuery) return fromQuery;
    if (typeof window !== "undefined") {
      return window.sessionStorage.getItem(VERIFY_EMAIL_STORAGE_KEY);
    }
    return null;
  });

  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [sendState, setSendState] = useState<
    "idle" | "sending" | "sent" | "error"
  >("idle");
  const [cooldown, setCooldown] = useState(0);
  const autoSentRef = useRef(false);
  const { shake } = useShake();

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const sendOtp = useCallback(async () => {
    if (!email) return null;

    setServerError(null);
    setSendState("sending");
    try {
      await authApi.sendVerificationOtp({ email });
      setSendState("sent");
      setCooldown(RESEND_COOLDOWN);
      return true;
    } catch (err: unknown) {
      setSendState("error");
      const message =
        err instanceof Error ? err.message : "Could not send the code. Please try again.";
      setServerError(message);
      return false;
    }
  }, [email]);

  useEffect(() => {
    if (email && !autoSentRef.current) {
      autoSentRef.current = true;
      sendOtp();
    }
  }, [email, sendOtp]);

  const handleResend = useCallback(() => {
    setOtp("");
    setOtpError(null);
    sendOtp();
  }, [sendOtp]);

  const handleComplete = useCallback(
    async (value: string) => {
      if (!email || value.length !== 6) return;

      setOtp(value);
      setOtpError(null);
      setServerError(null);
      setVerifying(true);

      try {
        const res = await authApi.verifyEmail({ email, otp: value });
        setAuthToken(res.data.token);
        queryClient.setQueryData(queryKeys.auth.me(), res.data.user);
        router.push("/dashboard");
      } catch (err: unknown) {
        if (err instanceof ApiError) {
          if (err.status === 404) {
            setOtpError("No account found for this email. Please sign up.");
          } else if (err.status === 400) {
            setOtpError(
              err.message === "This email is already verified"
                ? err.message
                : "That code is invalid or expired. Please try again."
            );
          } else {
            setOtpError(err.message);
          }
        } else {
          setOtpError("Verification failed. Please try again.");
        }
        setOtp("");
        shake();
      } finally {
        setVerifying(false);
      }
    },
    [email, queryClient, router, shake]
  );

  if (email === null) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-[420px] text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Email required
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            We couldn&apos;t determine which email to verify. Please sign in or
            sign up again.
          </p>
          <Button
            fullWidth
            size="lg"
            className="mt-6 rounded-lg"
            onClick={() => router.push("/login")}
          >
            Go to sign in
            <ArrowRight aria-hidden="true" />
          </Button>
        </div>
      </main>
    );
  }

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
              Already verified?
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
          <div className="w-full max-w-[440px]">
            <AnimatePresence mode="wait">
              {sendState === "sent" ? (
                <motion.div
                  key="verify"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="mb-6 inline-flex size-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <MailCheck className="size-6 text-foreground" aria-hidden="true" />
                  </div>

                  <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    Check your email
                  </h1>
                  <p className="mt-2 text-sm text-muted-foreground">
                    We sent a 6-digit verification code to{" "}
                    <span className="font-medium text-foreground">{email}</span>.
                    It expires in 10 minutes.
                  </p>

                  <div className="mt-8">
                    {serverError && (
                      <div
                        className="mb-4 rounded-lg bg-danger-muted border border-danger/20 px-4 py-3 text-sm text-danger"
                        role="alert"
                      >
                        {serverError}
                      </div>
                    )}

                    <label className="mb-2 block text-sm text-muted-foreground">
                      Verification code
                    </label>
                    <InputOTP
                      maxLength={6}
                      value={otp}
                      onChange={setOtp}
                      onComplete={handleComplete}
                      autoFocus
                      disabled={verifying}
                      aria-label="Verification code"
                    >
                      <InputOTPGroup>
                        {Array.from({ length: 6 }, (_, i) => (
                          <InputOTPSlot
                            key={i}
                            index={i}
                            data-invalid={otpError ? "true" : undefined}
                            className="h-12 w-11 text-lg"
                          />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>

                    {otpError && (
                      <p className="mt-2 text-sm text-danger" role="alert">
                        {otpError}
                      </p>
                    )}

                    {verifying && (
                      <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                        Verifying your code...
                      </p>
                    )}

                    <div className="mt-4 text-center">
                      <button
                        type="button"
                        onClick={handleResend}
                        disabled={cooldown > 0 || verifying}
                        className="text-sm text-foreground transition-opacity hover:opacity-70 disabled:cursor-not-allowed disabled:text-muted-foreground"
                      >
                        {cooldown > 0
                          ? `Resend code in ${cooldown}s`
                          : "Resend code"}
                      </button>
                    </div>

                    <p className="mt-4 text-xs text-muted-foreground text-center">
                      Beta access: Use verification code{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setOtp("000000");
                          handleComplete("000000");
                        }}
                        className="font-mono font-bold text-primary underline underline-offset-2 hover:opacity-80 transition-opacity"
                      >
                        000000
                      </button>
                    </p>
                  </div>

                  <Link
                    href="/login"
                    className="mt-8 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <ArrowLeft className="size-4" aria-hidden="true" />
                    Back to sign in
                  </Link>
                </motion.div>
              ) : (
                <motion.div
                  key="sending"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center"
                >
                  <div className="mb-4 inline-flex size-14 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                    {sendState === "error" ? (
                      <ShieldCheck className="size-7 text-foreground" aria-hidden="true" />
                    ) : (
                      <Loader2 className="size-7 animate-spin text-foreground" aria-hidden="true" />
                    )}
                  </div>

                  {sendState === "error" ? (
                    <>
                      <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        {serverError ?? "Something went wrong"}
                      </h1>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {serverError?.includes("already verified")
                          ? "Your email is already verified."
                          : serverError?.includes("No account")
                            ? "No account exists for this email."
                            : "The verification code could not be sent."}{" "}
                        Try again or go back to sign in.
                      </p>
                      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                        {serverError?.includes("already verified") && (
                          <Button
                            size="lg"
                            className="rounded-lg"
                            onClick={() => router.push("/login")}
                          >
                            Sign in
                            <ArrowRight aria-hidden="true" />
                          </Button>
                        )}
                        {serverError?.includes("No account") ? (
                          <Button
                            variant="secondary"
                            size="lg"
                            className="rounded-lg"
                            onClick={() => router.push("/signup")}
                          >
                            Create an account
                          </Button>
                        ) : (
                          <Button
                            variant="secondary"
                            size="lg"
                            className="rounded-lg"
                            onClick={handleResend}
                          >
                            Try again
                          </Button>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        Sending your code...
                      </h1>
                      <p className="mt-2 text-sm text-muted-foreground">
                        We&apos;re emailing a 6-digit verification code to {email}.
                      </p>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        <aside className="hidden w-full border-l border-border bg-zinc-50/75 dark:bg-zinc-900/40 lg:block lg:w-[480px] xl:w-[520px]">
          <WorkspacePreview variant="home" />
        </aside>
      </main>

      <AuthFooter
        center={
          <>
            <CheckCircle2 className="size-3.5" aria-hidden="true" />
            <span>Free forever · No credit card required</span>
          </>
        }
        right={
          <>
            <FooterLink href="/privacy">Privacy</FooterLink>
            <FooterLink href="/terms">Terms</FooterLink>
            <FooterLink href="/security">Security</FooterLink>
            <FooterLink href="/help">Help Center</FooterLink>
            <span className="text-muted-foreground">© 2025</span>
          </>
        }
      />
    </>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-8">
          <div className="animate-pulse text-muted-foreground text-sm">Loading...</div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}