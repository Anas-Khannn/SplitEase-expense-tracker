"use client";

import { useState } from "react";
import { KeyRound } from "lucide-react";
import { useOAuthLogin } from "@/hooks/useOAuthLogin";
import { Button } from "@/components/ui/primitives/button";
import { cn } from "@/lib/utils/cn";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}

function Spinner() {
  return (
    <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
  );
}

export function GoogleButton({
  className,
  label,
}: {
  className?: string;
  label?: string;
}) {
  const { mutate: oauthLogin, isPending } = useOAuthLogin();
  const [pending, setPending] = useState(false);

  return (
    <Button
      type="button"
      variant="outline"
      disabled={isPending}
      onClick={() => {
        setPending(true);
        oauthLogin("google");
      }}
      className={cn(
        "h-11 rounded-lg px-6 font-sans text-sm transition-all disabled:opacity-50",
        className
      )}
    >
      {pending && isPending ? (
        <Spinner />
      ) : (
        <GoogleIcon />
      )}
      <span>{label ?? "Continue with Google"}</span>
    </Button>
  );
}

export function PasskeyButton({
  className,
  label = "Continue with Passkey",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={() => {
        // Passkey auth is not wired up yet; keep the button decorative.
      }}
      className={cn(
        "h-11 rounded-lg px-6 font-sans text-sm transition-all",
        className
      )}
    >
      <KeyRound className="size-4" aria-hidden="true" />
      <span>{label}</span>
    </Button>
  );
}

interface SocialLoginProps {
  variant?: "split" | "stack";
  className?: string;
}

export default function SocialLogin({
  variant = "stack",
  className,
}: SocialLoginProps) {
  if (variant === "split") {
    return (
      <div className={cn("grid grid-cols-2 gap-3 w-full", className)}>
        <GoogleButton label="Google" />
        <PasskeyButton label="Passkey" />
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col space-y-3 w-full", className)}>
      <GoogleButton />
    </div>
  );
}