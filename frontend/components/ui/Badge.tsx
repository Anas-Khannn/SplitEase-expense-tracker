import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";
import { Badge as ShadcnBadge } from "./primitives/badge";

type BadgeVariant = "success" | "danger" | "warning" | "neutral" | "primary";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  success: "bg-success-muted text-success",
  danger: "bg-danger-muted text-danger",
  warning: "bg-warning-muted text-warning",
  neutral: "bg-muted text-muted-foreground",
  primary: "bg-primary text-primary-foreground",
};

function Badge({ className, variant = "neutral", ...props }: BadgeProps) {
  return (
    <ShadcnBadge
      className={cn(
        "h-auto rounded-full px-2.5 py-0.5 text-xs",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge, type BadgeProps, type BadgeVariant };
