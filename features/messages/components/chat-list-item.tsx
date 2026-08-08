"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ChatSummary } from "@/types/message";

function preview(chat: ChatSummary, viewerId: string) {
  if (!chat.lastMessage) return "No messages yet";
  const prefix = chat.lastMessage.senderId === viewerId ? "You: " : "";
  if (chat.lastMessage.type === "TEXT") return prefix + (chat.lastMessage.content ?? "");
  if (chat.lastMessage.type === "IMAGE") return prefix + "Sent a photo";
  if (chat.lastMessage.type === "VIDEO") return prefix + "Sent a video";
  if (chat.lastMessage.type === "VOICE") return prefix + "Sent a voice message";
  return prefix + "Sent a message";
}

export function ChatListItem({
  chat,
  viewerId,
  isActive,
}: {
  chat: ChatSummary;
  viewerId: string;
  isActive: boolean;
}) {
  const title = chat.type === "DIRECT" ? chat.otherParticipant?.username : chat.name ?? "Group chat";
  const avatarUrl = chat.type === "DIRECT" ? chat.otherParticipant?.avatarUrl : null;

  return (
    <Link
      href={`/messages/${chat.id}`}
      className={cn("flex items-center gap-3 px-4 py-3 hover:bg-muted", isActive && "bg-muted")}
    >
      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-muted">
        {avatarUrl && (
          <Image src={avatarUrl} alt={title ?? ""} width={48} height={48} className="h-full w-full object-cover" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{title}</p>
        <p className={cn("truncate text-xs", chat.unreadCount > 0 ? "font-semibold text-foreground" : "text-muted-foreground")}>
          {preview(chat, viewerId)}
        </p>
      </div>
      {chat.unreadCount > 0 && (
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500 text-[10px] font-semibold text-white">
          {chat.unreadCount}
        </span>
      )}
    </Link>
  );
}
