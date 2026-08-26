"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type IconButtonSize = "sm" | "md" | "lg";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  "aria-label": string;
  size?: IconButtonSize;
  variant?: "ghost" | "primary" | "danger";
}

const sizeStyles: Record<IconButtonSize, string> = {
  sm: "h-8 w-8 rounded-radius-sm",
  md: "h-10 w-10 rounded-radius-md",
  lg: "h-12 w-12 rounded-radius-md",
};

const variantStyles: Record<string, string> = {
  ghost:
    "text-text-secondary hover:bg-surface-alt hover:text-text-primary",
  primary:
    "text-white bg-primary-500 hover:bg-primary-600",
  danger:
    "text-white bg-danger-500 hover:bg-danger-500/90",
};

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, icon, size = "md", variant = "ghost", disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          "inline-flex items-center justify-center transition-colors duration-150",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring",
          "disabled:pointer-events-none disabled:opacity-50",
          sizeStyles[size],
          variantStyles[variant],
          className
        )}
        {...props}
      >
        <span className="[&>svg]:size-[1.125em]">{icon}</span>
      </button>
    );
  }
);

IconButton.displayName = "IconButton";

export { IconButton, type IconButtonProps, type IconButtonSize };
