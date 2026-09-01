import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";
import { Skeleton as ShadcnSkeleton } from "./primitives/skeleton";

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circle" | "rect";
  width?: string;
  height?: string;
}

function Skeleton({
  variant = "text",
  width,
  height,
  className,
  ...props
}: SkeletonProps) {
  const variantStyles: Record<string, string> = {
    text: "h-4 w-full",
    circle: "rounded-full",
    rect: "",
  };

  return (
    <ShadcnSkeleton
      className={cn(variantStyles[variant], className)}
      style={{ width, height }}
      {...props}
    />
  );
}

export { Skeleton, type SkeletonProps };
