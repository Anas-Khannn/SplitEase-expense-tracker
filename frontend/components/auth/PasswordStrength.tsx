"use client";

import { CheckCircle2, Info, XCircle } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const RULES = [
  { label: "8+ characters", test: (pw: string) => pw.length >= 8 },
  { label: "Uppercase & lowercase", test: (pw: string) => /[a-z]/i.test(pw) },
  { label: "Number", test: (pw: string) => /\d/.test(pw) },
  { label: "Symbol", test: (pw: string) => /[^A-Za-z0-9]/.test(pw) },
];

export function getPasswordScore(password: string): number {
  return RULES.filter((r) => r.test(password)).length;
}

export function getPasswordLabel(score: number): string {
  if (score <= 0) return "Too weak";
  if (score === 1) return "Weak";
  if (score === 2) return "Fair";
  if (score === 3) return "Good";
  return "Strong";
}

interface PasswordStrengthProps {
  password: string;
  caption?: string;
  className?: string;
}

export function PasswordStrength({
  password,
  caption,
  className,
}: PasswordStrengthProps) {
  const score = getPasswordScore(password);
  const label = getPasswordLabel(score);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {caption ?? "Password strength"}
        </p>
        <span
          className={cn(
            "text-xs font-medium",
            label === "Strong"
              ? "text-success"
              : label === "Good" || label === "Fair"
                ? "text-warning"
                : "text-danger"
          )}
        >
          {label}
        </span>
      </div>
      <div className="flex gap-1.5" aria-hidden="true">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors",
              i < score
                ? label === "Strong"
                  ? "bg-success"
                  : label === "Good" || label === "Fair"
                    ? "bg-warning"
                    : "bg-danger"
                : "bg-zinc-200 dark:bg-zinc-700"
            )}
          />
        ))}
      </div>
    </div>
  );
}

interface PasswordRequirementsProps {
  password: string;
  className?: string;
}

export function PasswordRequirements({
  password,
  className,
}: PasswordRequirementsProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-2 rounded-lg border border-border bg-muted/40 p-3",
        className
      )}
    >
      {RULES.map((rule) => {
        const ok = rule.test(password);
        return (
          <div
            key={rule.label}
            className="flex items-center gap-2 text-xs text-muted-foreground"
          >
            {ok ? (
              <CheckCircle2
                className="size-3.5 shrink-0 text-success"
                aria-hidden="true"
              />
            ) : (
              <XCircle
                className="size-3.5 shrink-0 text-zinc-300 dark:text-zinc-600"
                aria-hidden="true"
              />
            )}
            <span className={cn(ok && "text-foreground")}>{rule.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export function SecurityNotice({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-muted/40 px-3 py-2.5 text-xs text-muted-foreground">
      <Info className="size-3.5 shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </div>
  );
}