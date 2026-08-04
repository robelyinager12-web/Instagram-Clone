"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { NotificationItem } from "@/types/notification";

function timeAgo(iso: string) {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  const units: [number, string][] = [
    [60, "s"], [60, "m"], [24, "h"], [7, "d"], [4.345, "w"], [12, "mo"], [Infinity, "y"],
  ];
  let value = seconds;
  for (const [amount, label] of units) {
    if (value < amount) return `${Math.floor(value)}${label}`;
    value /= amount;
  }
  return "";
}

const MESSAGES: Record<NotificationItem["type"], string> = {
  LIKE_POST: "liked your post.",
  LIKE_COMMENT: "liked your comment.",
  COMMENT: "commented on your post.",
  REPLY: "replied to your comment.",
  MENTION: "mentioned you.",
  FOLLOW: "started following you.",
  FOLLOW_REQUEST: "requested to follow you.",
  FOLLOW_ACCEPTED: "accepted your follow request.",
  MESSAGE: "sent you a message.",
  TAGGED: "tagged you in a post.",
};

export function NotificationRow({
  notification,
  onRead,
}: {
  notification: NotificationItem;
  onRead: (id: string) => void;
}) {
  const href = notification.postId
    ? `/post/${notification.postId}`
    : `/profile/${notification.actor.username}`;

  return (
    <Link
      href={href}
      onClick={() => !notification.isRead && onRead(notification.id)}
      className={cn(
        "flex items-center gap-3 px-4 py-3 hover:bg-muted",
        !notification.isRead && "bg-blue-500/5"
      )}
    >
      <div className="relative shrink-0">
        <div className="h-11 w-11 overflow-hidden rounded-full bg-muted">
          {notification.actor.avatarUrl && (
            <Image
              src={notification.actor.avatarUrl}
              alt={notification.actor.username}
              width={44}
              height={44}
              className="h-full w-full object-cover"
            />
          )}
        </div>
        {!notification.isRead && (
          <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-blue-500 ring-2 ring-background" />
        )}
      </div>

      <p className="min-w-0 flex-1 text-sm">
        <span className="font-semibold">{notification.actor.username}</span>{" "}
        {MESSAGES[notification.type]}{" "}
        <span className="text-muted-foreground">{timeAgo(notification.createdAt)}</span>
      </p>

      {notification.postThumbnailUrl && (
        <div className="h-11 w-11 shrink-0 overflow-hidden bg-muted">
          <Image
            src={notification.postThumbnailUrl}
            alt=""
            width={44}
            height={44}
            className="h-full w-full object-cover"
          />
        </div>
      )}
    </Link>
  );
}
