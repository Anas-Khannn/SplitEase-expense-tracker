"use client";

import { Split } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface SplitEaseLogoProps {
  variant?: "circles" | "tile" | "wordmark";
  className?: string;
  iconClassName?: string;
}

export function SplitEaseLogo({
  variant = "circles",
  className,
  iconClassName,
}: SplitEaseLogoProps) {
  if (variant === "wordmark") {
    return (
      <span className={cn("text-foreground", className)}>
        <span className="text-lg font-semibold tracking-tight">SplitEase</span>
      </span>
    );
  }

  if (variant === "tile") {
    return (
      <span
        className={cn("relative flex h-6 w-6 items-center justify-center", className)}
        aria-hidden="true"
      >
        <span className="absolute inset-0 rounded-md bg-foreground" />
        <Split className={cn("relative size-3.5 text-background", iconClassName)} />
      </span>
    );
  }

  return (
    <span className={cn("relative flex items-center", className)} aria-hidden="true">
      <span className={cn("relative inline-flex h-4 w-7", iconClassName)}>
        <span className="absolute left-0 top-0 h-4 w-4 rounded-full bg-foreground" />
        <span className="absolute left-3 top-0 h-4 w-4 rounded-full bg-foreground mix-blend-multiply opacity-70" />
      </span>
      <span className="ml-2 text-lg font-semibold tracking-tight text-foreground">
        SplitEase
      </span>
    </span>
  );
}