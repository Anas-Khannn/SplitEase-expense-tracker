"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { notificationsApi } from "@/services";
import { queryKeys } from "@/lib/query-keys";
import type { AppNotification, NotificationListResponse } from "@/types";

interface SseEnvelope {
  event?: string;
  data?: AppNotification;
}

export function useNotificationStream(enabled = true) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;
    const token = localStorage.getItem("token");
    if (!token) return;

    let controller: AbortController | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    const handleNotification = (notification: AppNotification) => {
      queryClient.setQueryData<number>(
        queryKeys.notifications.unreadCount(),
        (current) => (current ?? 0) + 1
      );

      queryClient.setQueryData<NotificationListResponse>(
        queryKeys.notifications.list(),
        (current) => {
          if (!current) return current;
          return {
            ...current,
            notifications: [
              notification,
              ...current.notifications.filter(
                (n) => n.notification_id !== notification.notification_id
              ),
            ],
          };
        }
      );
    };

    const connect = async () => {
      controller = new AbortController();

      try {
        const res = await fetch(notificationsApi.streamUrl(), {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });

        if (!res.ok || !res.body) return;

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const frames = buffer.split("\n\n");
          buffer = frames.pop() ?? "";

          for (const frame of frames) {
            let dataLine = "";
            for (const line of frame.split("\n")) {
              if (line.startsWith("data: ")) {
                dataLine += line.slice(6);
              }
            }
            if (!dataLine) continue;
            let envelope: SseEnvelope;
            try {
              envelope = JSON.parse(dataLine) as SseEnvelope;
            } catch {
              continue;
            }
            if (envelope.event === "notification" && envelope.data) {
              handleNotification(envelope.data);
            }
          }
        }
      } catch {
        // aborted or connection closed
      } finally {
        if (!controller?.signal.aborted && enabled) {
          reconnectTimer = setTimeout(connect, 5000);
        }
      }
    };

    connect();

    return () => {
      if (reconnectTimer) clearTimeout(reconnectTimer);
      controller?.abort();
    };
  }, [queryClient, enabled]);
}