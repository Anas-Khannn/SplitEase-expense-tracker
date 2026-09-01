import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";
import {
  Card as ShadcnCard,
  CardHeader as ShadcnCardHeader,
  CardContent as ShadcnCardContent,
  CardFooter as ShadcnCardFooter,
} from "./primitives/card";

type CardVariant = "default" | "elevated" | "interactive";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
}

const variantStyles: Record<CardVariant, string> = {
  default: "",
  elevated: "",
  interactive:
    "hover:border-foreground/20 transition-colors duration-150 cursor-pointer",
};

function Card({ className, variant = "default", ...props }: CardProps) {
  return (
    <ShadcnCard
      className={cn(variantStyles[variant], className)}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <ShadcnCardHeader className={cn("border-b border-border", className)} {...props} />;
}

function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <ShadcnCardContent className={cn("px-5 py-4", className)} {...props} />;
}

function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <ShadcnCardFooter
      className={cn("bg-muted/40", className)}
      {...props}
    />
  );
}

export { Card, CardHeader, CardContent, CardFooter, type CardProps, type CardVariant };
