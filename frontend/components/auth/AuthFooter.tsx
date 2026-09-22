import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface AuthFooterProps {
  left?: ReactNode;
  center?: ReactNode;
  right?: ReactNode;
  className?: string;
}

export function AuthFooter({
  left,
  center,
  right,
  className,
}: AuthFooterProps) {
  return (
    <footer
      className={cn(
        "w-full border-t border-border bg-background",
        className
      )}
    >
      <div className="mx-auto flex w-full max-w-[1440px] flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-5 text-sm text-muted-foreground sm:px-6 lg:px-8">
        <div>{left}</div>
        {center && <div className="flex items-center gap-6">{center}</div>}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          {right}
        </div>
      </div>
    </footer>
  );
}

export function FooterLink({
  href = "#",
  children,
}: {
  href?: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      {children}
    </a>
  );
}