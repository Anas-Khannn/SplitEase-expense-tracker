import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type BadgeVariant = "success" | "danger" | "warning" | "neutral" | "primary";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  success: "bg-success-100 text-success-500",
  danger: "bg-danger-100 text-danger-500",
  warning: "bg-warning-100 text-warning-500",
  neutral: "bg-surface-alt text-text-secondary",
  primary: "bg-primary-100 text-primary-600",
};

function Badge({ className, variant = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-radius-full px-2.5 py-0.5 text-caption font-medium leading-none",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge, type BadgeProps, type BadgeVariant };
