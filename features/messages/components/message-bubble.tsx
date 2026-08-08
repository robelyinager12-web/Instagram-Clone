"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import type { MessageItem } from "@/types/message";

export function MessageBubble({
  message,
  isOwn,
}: {
  message: MessageItem;
  isOwn: boolean;
}) {
  return (
    <div className={cn("flex", isOwn ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[70%] rounded-2xl px-3 py-2 text-sm",
          isOwn ? "bg-blue-500 text-white" : "bg-muted"
        )}
      >
        {message.type === "TEXT" && <p className="whitespace-pre-wrap">{message.content}</p>}

        {message.type === "IMAGE" && message.mediaUrl && (
          <Image
            src={message.mediaUrl}
            alt="Image message"
            width={240}
            height={240}
            className="rounded-lg object-cover"
          />
        )}

        {message.type === "VIDEO" && message.mediaUrl && (
          <video src={message.mediaUrl} controls className="w-60 rounded-lg" />
        )}

        {message.type === "VOICE" && message.mediaUrl && (
          <audio src={message.mediaUrl} controls className="w-52" />
        )}

        {isOwn && (
          <p className="mt-0.5 text-right text-[10px] opacity-70">
            {message.isReadByOther ? "Seen" : "Sent"}
          </p>
        )}
      </div>
    </div>
  );
}
