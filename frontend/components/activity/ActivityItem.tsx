"use client";

import {
  Users,
  UserPlus,
  UserMinus,
  ReceiptText,
  Pencil,
  Trash2,
  HandCoins,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { Activity, ActivityAction } from "@/types";

const actionPresentation: Record<
  ActivityAction,
  { icon: LucideIcon; label: string; className: string }
> = {
  GROUP_CREATED: {
    icon: Users,
    label: "Group created",
    className: "bg-primary-100 text-primary-600",
  },
  MEMBER_ADDED: {
    icon: UserPlus,
    label: "Member added",
    className: "bg-success-100 text-success-500",
  },
  MEMBER_REMOVED: {
    icon: UserMinus,
    label: "Member removed",
    className: "bg-danger-100 text-danger-500",
  },
  EXPENSE_CREATED: {
    icon: ReceiptText,
    label: "Expense added",
    className: "bg-primary-100 text-primary-600",
  },
  EXPENSE_UPDATED: {
    icon: Pencil,
    label: "Expense updated",
    className: "bg-warning-100 text-warning-500",
  },
  EXPENSE_DELETED: {
    icon: Trash2,
    label: "Expense removed",
    className: "bg-danger-100 text-danger-500",
  },
  PAYMENT_CREATED: {
    icon: HandCoins,
    label: "Payment recorded",
    className: "bg-success-100 text-success-500",
  },
};

const fallbackPresentation = {
  icon: Users,
  label: "Group activity",
  className: "bg-surface-alt text-text-secondary",
};

interface ActivityItemProps {
  activity: Activity;
}

function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function ActivityItem({ activity }: ActivityItemProps) {
  const presentation =
    actionPresentation[activity.action] ?? fallbackPresentation;
  const Icon = presentation.icon;
  const actorName = activity.user?.name || activity.user?.user_id || "Someone";

  return (
    <div className="relative flex gap-3 pl-4">
      <span
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
          presentation.className
        )}
        aria-hidden="true"
      >
        <Icon size={18} />
      </span>

      <div className="min-w-0 flex-1 py-0.5">
        <p className="text-body-sm text-text-primary">
          <span className="font-semibold">{actorName}</span>{" "}
          <span className="text-text-muted">{presentation.label}</span>
        </p>
        {activity.description && (
          <p className="mt-0.5 text-body text-text-secondary break-words">
            {activity.description}
          </p>
        )}
        {(() => {
          const date = formatTimestamp(activity.created_at);
          const time = formatTime(activity.created_at);
          if (!date && !time) return null;
          return (
            <p className="mt-0.5 flex flex-wrap items-center gap-1 text-caption text-text-muted">
              {date && <span>{date}</span>}
              {time && <span>· {time}</span>}
            </p>
          );
        })()}
      </div>
    </div>
  );
}
