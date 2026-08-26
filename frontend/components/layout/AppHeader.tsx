"use client";

import { IconButton } from "@/components/ui";
import { Menu } from "lucide-react";

interface AppHeaderProps {
  onMenuToggle?: () => void;
}

export function AppHeader({ onMenuToggle }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-border-default bg-surface/80 backdrop-blur-sm px-4 lg:hidden">
      {onMenuToggle && (
        <IconButton
          icon={<Menu />}
          size="sm"
          aria-label="Open navigation menu"
          onClick={onMenuToggle}
        />
      )}
      <span className="text-h3 font-bold text-primary-500">SplitEase</span>
    </header>
  );
}
