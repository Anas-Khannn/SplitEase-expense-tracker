"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-600 focus-visible:ring-primary-500",
  secondary:
    "bg-surface border border-border-default text-text-primary hover:bg-surface-alt focus-visible:ring-primary-500",
  ghost:
    "bg-transparent text-text-secondary hover:bg-surface-alt hover:text-text-primary focus-visible:ring-primary-500",
  danger:
    "bg-danger-500 text-white hover:bg-danger-500/90 focus-visible:ring-danger-500",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-caption gap-1.5 rounded-radius-sm",
  md: "h-10 px-4 text-button gap-2 rounded-radius-md",
  lg: "h-12 px-6 text-body gap-2.5 rounded-radius-md",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      icon,
      iconPosition = "left",
      fullWidth = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          "inline-flex items-center justify-center font-semibold transition-colors duration-150",
          "focus-visible:outline-2 focus-visible:outline-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && "w-full",
          className
        )}
        {...props}
      >
        {loading ? (
          <Loader2 className="animate-spin shrink-0" size={size === "sm" ? 14 : 16} />
        ) : (
          icon && (
            <span className="shrink-0 [&>svg]:size-[1em]">{icon}</span>
          )
        )}
        {children && <span>{children}</span>}
        {!loading && icon && iconPosition === "right" && (
          <span className="shrink-0 [&>svg]:size-[1em]">{icon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button, type ButtonProps, type ButtonVariant, type ButtonSize };
