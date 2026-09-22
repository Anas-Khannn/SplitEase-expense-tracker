import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { SplitEaseLogo } from "./SplitEaseLogo";

interface AuthHeaderProps {
  left?: ReactNode;
  center?: ReactNode;
  right?: ReactNode;
  className?: string;
}

export function AuthHeader({
  left,
  center,
  right,
  className,
}: AuthHeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-sm",
        className
      )}
    >
      <div className="mx-auto flex h-14 w-full max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          {left ?? <SplitEaseLogo variant="circles" />}
        </div>
        {center && <div className="flex items-center">{center}</div>}
        <div className="flex items-center gap-4">{right}</div>
      </div>
    </header>
  );
}