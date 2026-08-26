import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type CardVariant = "default" | "elevated" | "interactive";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
}

const variantStyles: Record<CardVariant, string> = {
  default: "bg-surface border border-border-default shadow-xs",
  elevated: "bg-surface border border-border-default shadow-md",
  interactive:
    "bg-surface border border-border-default shadow-xs hover:shadow-sm hover:border-border-strong transition-shadow duration-150 cursor-pointer",
};

function Card({ className, variant = "default", ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-radius-lg overflow-hidden",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("px-5 py-4 border-b border-border-default", className)}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-5 py-4", className)} {...props} />;
}

function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "px-5 py-3 border-t border-border-default bg-surface-alt/50",
        className
      )}
      {...props}
    />
  );
}

export { Card, CardHeader, CardContent, CardFooter, type CardProps, type CardVariant };
