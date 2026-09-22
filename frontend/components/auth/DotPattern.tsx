import { cn } from "@/lib/utils/cn";

interface DotPatternProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeMap: Record<string, string> = {
  sm: "[background-size:24px_24px]",
  md: "[background-size:28px_28px]",
  lg: "[background-size:32px_32px]",
};

export function DotPattern({ className, size = "md" }: DotPatternProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0",
        "bg-[radial-gradient(circle,rgba(24,24,27,0.06)_1px,transparent_1px)]",
        sizeMap[size],
        "dark:bg-[radial-gradient(circle,rgba(255,255,255,0.10)_1px,transparent_1px)]",
        className
      )}
    />
  );
}

export function GridPattern({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0",
        "bg-[linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)] [background-size:28px_28px]",
        "dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)]",
        className
      )}
    />
  );
}