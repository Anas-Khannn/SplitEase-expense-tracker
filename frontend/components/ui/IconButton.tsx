"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { Button as ShadcnButton } from "./primitives/button";

type IconButtonSize = "sm" | "md" | "lg";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  "aria-label": string;
  size?: IconButtonSize;
  variant?: "ghost" | "primary" | "danger";
}

const sizeMap: Record<IconButtonSize, "icon-sm" | "icon" | "icon-lg"> = {
  sm: "icon-sm",
  md: "icon",
  lg: "icon-lg",
};

const variantMap: Record<string, "ghost" | "default" | "destructive"> = {
  ghost: "ghost",
  primary: "default",
  danger: "destructive",
};

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, icon, size = "md", variant = "ghost", disabled, ...props }, ref) => {
    return (
      <ShadcnButton
        ref={ref}
        disabled={disabled}
        variant={variantMap[variant]}
        size={sizeMap[size]}
        className={cn("shrink-0", className)}
        {...props}
      >
        <span className="[&>svg]:size-4">{icon}</span>
      </ShadcnButton>
    );
  }
);

IconButton.displayName = "IconButton";

export { IconButton, type IconButtonProps, type IconButtonSize };
