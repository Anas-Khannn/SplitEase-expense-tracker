"use client";

import { cn } from "@/lib/utils/cn";
import { motion } from "framer-motion";

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
      className="relative flex rounded-radius-md bg-surface-alt p-0.5"
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
            "relative z-10 flex-1 h-9 text-body-sm font-medium rounded-radius-sm",
            "transition-colors duration-150 cursor-pointer",
            "disabled:cursor-not-allowed disabled:opacity-50",
            value === opt.key ? "text-text-primary" : "text-text-muted"
          )}
        >
          {opt.label}
        </button>
      ))}
      <motion.div
        className="absolute top-0.5 bottom-0.5 rounded-radius-sm bg-surface shadow-xs"
        layout
        transition={{ type: "spring", stiffness: 500, damping: 35 }}
        style={{
          left: value === "email" ? "2px" : "50%",
          right: value === "email" ? "50%" : "2px",
        }}
      />
    </div>
  );
}
