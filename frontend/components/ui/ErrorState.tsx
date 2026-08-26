import { type ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface ErrorStateProps {
  icon?: ReactNode;
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

function ErrorState({
  icon,
  title = "Something went wrong",
  description,
  onRetry,
  retryLabel = "Try again",
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-6 text-center",
        className
      )}
    >
      <div className="mb-4 text-danger-500 [&>svg]:size-12">
        {icon ?? <AlertCircle />}
      </div>
      <h3 className="text-h3 font-semibold text-text-primary">{title}</h3>
      {description && (
        <p className="mt-2 max-w-sm text-body-sm text-text-secondary">
          {description}
        </p>
      )}
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-5 px-4 py-2 text-button font-semibold text-primary-500 rounded-radius-md hover:bg-primary-100 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
        >
          {retryLabel}
        </button>
      )}
    </div>
  );
}

export { ErrorState, type ErrorStateProps };
