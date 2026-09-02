"use client";

import { type ReactNode } from "react";

interface AuthCardProps {
  children: ReactNode;
  screenKey: string;
  className?: string;
}

export default function AuthCard({
  children,
  className,
}: AuthCardProps) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}
