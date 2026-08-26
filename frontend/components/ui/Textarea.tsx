"use client";

import { forwardRef, useId, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, id: idProp, required, disabled, ...props }, ref) => {
    const generatedId = useId();
    const id = idProp ?? generatedId;
    const errorId = `${id}-error`;
    const helperId = `${id}-helper`;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={id}
            className="text-body-sm font-medium text-text-primary"
          >
            {label}
            {required && (
              <span className="ml-0.5 text-danger-500" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}
        <textarea
          ref={ref}
          id={id}
          required={required}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={
            error ? errorId : helperText ? helperId : undefined
          }
          className={cn(
            "min-h-[80px] w-full rounded-radius-md border bg-surface px-3 py-2.5 text-body",
            "text-text-primary placeholder:text-text-muted",
            "transition-colors duration-150 resize-y",
            "focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-focus-ring",
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-surface-alt",
            error
              ? "border-danger-500 focus-visible:outline-danger-500"
              : "border-border-default hover:border-border-strong",
            className
          )}
          {...props}
        />
        {error && (
          <p id={errorId} className="text-caption text-danger-500" role="alert">
            {error}
          </p>
        )}
        {!error && helperText && (
          <p id={helperId} className="text-caption text-text-muted">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export { Textarea, type TextareaProps };
