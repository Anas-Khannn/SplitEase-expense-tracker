import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

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
  const base =
    "animate-pulse rounded-radius-sm bg-surface-alt motion-reduce:animate-none";

  const variantStyles: Record<string, string> = {
    text: "h-4 w-full rounded-radius-sm",
    circle: "rounded-full",
    rect: "rounded-radius-md",
  };

  return (
    <div
      aria-hidden="true"
      className={cn(base, variantStyles[variant], className)}
      style={{ width, height }}
      {...props}
    />
  );
}

export { Skeleton, type SkeletonProps };
