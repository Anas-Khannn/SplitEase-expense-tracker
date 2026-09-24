"use client";

import { Bell, CheckCheck } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNotifications, useUnreadCount } from "@/hooks";
import {
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from "@/hooks/mutations";
import { useNotificationStream } from "@/hooks/useNotificationStream";
import { timeAgo } from "@/lib/selectors/format";
import { cn } from "@/lib/utils/cn";
import type { AppNotification } from "@/types";

const NOTIFICATION_EMOJI: Partial<Record<AppNotification["type"], string>> = {
  EXPENSE_CREATED: "🧾",
  EXPENSE_UPDATED: "✏️",
  EXPENSE_DELETED: "🗑️",
  PAYMENT_CREATED: "💸",
  MEMBER_ADDED: "👤",
  MEMBER_REMOVED: "🚫",
  MEMBER_ROLE_CHANGED: "🛡️",
  REACTION_ADDED: "😀",
};

export function NotificationsDropdown() {
  const unread = useUnreadCount();
  useNotificationStream(true);

  const notificationsQuery = useNotifications({ limit: 20 });
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const notifications = notificationsQuery.data?.notifications ?? [];
  const unreadCount = unread.data ?? 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Notifications${unreadCount ? ` (${unreadCount} unread)` : ""}`}
        className="relative flex size-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground outline-none data-popup-open:bg-muted data-popup-open:text-foreground"
      >
        <Bell className="size-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-1.5 -top-1.5 inline-flex min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white ring-2 ring-background">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-[min(92vw,360px)]"
      >
        <div className="flex items-center justify-between px-2 pt-1.5 pb-1">
          <span className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
            Notifications
          </span>
          {notifications.some((n) => !n.is_read) && (
            <button
              type="button"
              onClick={() => markAllRead.mutate()}
              disabled={markAllRead.isPending}
              className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
            >
              <CheckCheck className="size-3" />
              Mark all read
            </button>
          )}
        </div>

        <DropdownMenuSeparator />

        {notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-1 px-4 py-10 text-center">
            <span className="text-2xl">🔔</span>
            <p className="text-xs font-medium text-foreground">
              You are all caught up
            </p>
            <p className="text-[11px] text-muted-foreground">
              New group activity will show up here.
            </p>
          </div>
        ) : (
          <DropdownMenuGroup className="max-h-96 overflow-y-auto">
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.notification_id}
                className="flex items-start gap-2.5 px-2.5 py-2.5"
                onClick={() => {
                  if (!notification.is_read) {
                    markRead.mutate(notification.notification_id);
                  }
                }}
              >
                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm">
                  {NOTIFICATION_EMOJI[notification.type] ?? "🔔"}
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      "block truncate text-xs font-semibold",
                      notification.is_read
                        ? "text-muted-foreground"
                        : "text-foreground"
                    )}
                  >
                    {notification.title}
                  </span>
                  <span className="mt-0.5 block text-[11px] leading-snug text-muted-foreground line-clamp-2">
                    {notification.message}
                  </span>
                  <span className="mt-1 block text-[10px] text-muted-foreground/70">
                    {timeAgo(notification.created_at)}
                  </span>
                </span>
                {!notification.is_read && (
                  <span className="mt-1.5 size-2 shrink-0 rounded-full bg-rose-500" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}