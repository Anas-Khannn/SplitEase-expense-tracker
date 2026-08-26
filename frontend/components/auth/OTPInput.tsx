"use client";

import {
  useRef,
  useCallback,
  useId,
  type KeyboardEvent,
  type ClipboardEvent,
} from "react";
import { cn } from "@/lib/utils/cn";

interface OTPInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  error?: string;
  disabled?: boolean;
  "aria-label"?: string;
}

export default function OTPInput({
  value,
  onChange,
  length = 6,
  error,
  disabled = false,
  "aria-label": ariaLabel = "Verification code",
}: OTPInputProps) {
  const baseId = useId();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const focusInput = useCallback(
    (idx: number) => {
      const clamped = Math.max(0, Math.min(length - 1, idx));
      inputRefs.current[clamped]?.focus();
      inputRefs.current[clamped]?.select();
    },
    [length]
  );

  const handleChange = useCallback(
    (idx: number, digit: string) => {
      if (disabled) return;
      const cleaned = digit.replace(/\D/g, "").slice(-1);
      const arr = value.split("");
      while (arr.length < length) arr.push("");
      arr[idx] = cleaned;
      const next = arr.join("");
      onChange(next);
      if (cleaned && idx < length - 1) {
        focusInput(idx + 1);
      }
    },
    [value, onChange, length, disabled, focusInput]
  );

  const handleKeyDown = useCallback(
    (idx: number, e: KeyboardEvent<HTMLInputElement>) => {
      if (disabled) return;
      const arr = value.split("");
      while (arr.length < length) arr.push("");

      if (e.key === "Backspace") {
        e.preventDefault();
        if (arr[idx]) {
          arr[idx] = "";
          onChange(arr.join(""));
        } else if (idx > 0) {
          arr[idx - 1] = "";
          onChange(arr.join(""));
          focusInput(idx - 1);
        }
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        focusInput(idx - 1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        focusInput(idx + 1);
      }
    },
    [value, onChange, length, disabled, focusInput]
  );

  const handlePaste = useCallback(
    (e: ClipboardEvent<HTMLInputElement>) => {
      if (disabled) return;
      e.preventDefault();
      const pasted = e.clipboardData
        .getData("text")
        .replace(/\D/g, "")
        .slice(0, length);
      if (pasted) {
        onChange(pasted);
        const focusIdx = Math.min(pasted.length, length - 1);
        focusInput(focusIdx);
      }
    },
    [onChange, length, disabled, focusInput]
  );

  const digits = value.split("");
  while (digits.length < length) digits.push("");

  return (
    <div>
      <label className="text-body-sm font-medium text-text-primary mb-2 block">
        {ariaLabel}
      </label>
      <div
        className="flex gap-2.5"
        role="group"
        aria-label={ariaLabel}
      >
        {Array.from({ length }, (_, i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el; }}
            id={`${baseId}-${i}`}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={1}
            disabled={disabled}
            value={digits[i] ?? ""}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            onFocus={(e) => e.target.select()}
            aria-label={`Digit ${i + 1} of ${length}`}
            className={cn(
              "w-11 h-12 text-center text-h3 font-semibold",
              "rounded-radius-md border bg-surface",
              "transition-colors duration-150",
              "focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-focus-ring",
              "disabled:cursor-not-allowed disabled:opacity-50",
              error
                ? "border-danger-500 focus-visible:outline-danger-500"
                : "border-border-default hover:border-border-strong"
            )}
          />
        ))}
      </div>
      {error && (
        <p className="text-caption text-danger-500 mt-1.5" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
