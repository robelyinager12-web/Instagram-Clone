"use client";

import { usePathname } from "next/navigation";
import { ChatListItem } from "./chat-list-item";
import type { ChatSummary } from "@/types/message";

export function ChatList({ chats, viewerId }: { chats: ChatSummary[]; viewerId: string }) {
  const pathname = usePathname();

  if (chats.length === 0) {
    return (
      <p className="px-4 py-8 text-center text-sm text-muted-foreground">
        No conversations yet.
      </p>
    );
  }

  return (
    <div className="divide-y divide-border">
      {chats.map((chat) => (
        <ChatListItem
          key={chat.id}
          chat={chat}
          viewerId={viewerId}
          isActive={pathname === `/messages/${chat.id}`}
        />
      ))}
    </div>
  );
}
