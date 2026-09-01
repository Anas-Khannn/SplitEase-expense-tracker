"use client";

import { cn } from "@/lib/utils/cn";

type AuthMethod = "email" | "phone";

interface AuthMethodToggleProps {
  value: AuthMethod;
  onChange: (method: AuthMethod) => void;
  disabled?: boolean;
}

export default function AuthMethodToggle({
  value,
  onChange,
  disabled = false,
}: AuthMethodToggleProps) {
  const options: { key: AuthMethod; label: string }[] = [
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
  ];

  return (
    <div
      className="flex border border-border"
      role="tablist"
      aria-label="Authentication method"
    >
      {options.map((opt) => (
        <button
          key={opt.key}
          type="button"
          role="tab"
          aria-selected={value === opt.key}
          disabled={disabled}
          onClick={() => onChange(opt.key)}
          className={cn(
            "flex-1 h-9 text-sm transition-colors duration-150 cursor-pointer border-b-2 -mb-px",
            "disabled:cursor-not-allowed disabled:opacity-50",
            value === opt.key
              ? "border-foreground text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
