"use client";

import { useEffect, useRef, useState } from "react";
import { useNotificationsQuery } from "../hooks/use-notifications-query";
import { NotificationRow } from "./notification-row";
import { markNotificationRead } from "@/actions/notifications/mark-notification-read";
import { markAllNotificationsRead } from "@/actions/notifications/mark-all-read";
import type { NotificationsPage } from "@/types/notification";

export function NotificationList({ initialPage }: { initialPage: NotificationsPage }) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useNotificationsQuery(initialPage);

  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "600px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const notifications = data?.pages.flatMap((page) => page.notifications) ?? [];
  const unreadCount = data?.pages[0]?.unreadCount ?? 0;

  function handleRead(id: string) {
    setReadIds((prev) => new Set(prev).add(id));
    markNotificationRead(id).catch(() => {
      // Non-critical — worst case the badge stays until the next full refetch.
    });
  }

  async function handleMarkAllRead() {
    setReadIds(new Set(notifications.map((n) => n.id)));
    await markAllNotificationsRead();
  }

  if (notifications.length === 0) {
    return (
      <p className="px-4 py-16 text-center text-sm text-muted-foreground">
        No notifications yet.
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <div className="flex items-center justify-between px-4 py-3">
        <h1 className="text-lg font-semibold">Notifications</h1>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} className="text-xs font-semibold text-blue-500">
            Mark all as read
          </button>
        )}
      </div>

      <div>
        {notifications.map((n) => (
          <NotificationRow
            key={n.id}
            notification={readIds.has(n.id) ? { ...n, isRead: true } : n}
            onRead={handleRead}
          />
        ))}
      </div>

      <div ref={sentinelRef} />
      {isFetchingNextPage && (
        <p className="py-4 text-center text-xs text-muted-foreground">Loading more…</p>
      )}
    </div>
  );
}
