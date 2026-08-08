"use client";

import { useEffect, useRef } from "react";
import { useChatThread } from "../hooks/use-chat-thread";
import { MessageBubble } from "./message-bubble";
import { MessageComposer } from "./message-composer";
import { TypingIndicator } from "./typing-indicator";
import { sendMessage } from "@/actions/messages/send-message";
import { markChatRead } from "@/actions/messages/mark-chat-read";
import type { MessageItem, MessagesPage } from "@/types/message";

export function MessageThread({
  chatId,
  viewerId,
  viewerUsername,
  initialPage,
}: {
  chatId: string;
  viewerId: string;
  viewerUsername: string;
  initialPage: MessagesPage;
}) {
  const { data, typingUsername, broadcastTyping, appendOptimisticMessage } =
    useChatThread(chatId, viewerId, initialPage);

  const bottomRef = useRef<HTMLDivElement>(null);
  const typingThrottleRef = useRef(0);

  const messages = data?.pages.flatMap((p) => p.messages) ?? [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  useEffect(() => {
    markChatRead(chatId).catch(() => {});
  }, [chatId]);

  function handleTyping() {
    const now = Date.now();
    if (now - typingThrottleRef.current < 2000) return;
    typingThrottleRef.current = now;
    broadcastTyping(viewerUsername);
  }

  async function handleSendText(content: string) {
    const optimistic: MessageItem = {
      id: `optimistic-${Date.now()}`,
      chatId,
      senderId: viewerId,
      type: "TEXT",
      content,
      mediaUrl: null,
      createdAt: new Date().toISOString(),
      isReadByOther: false,
    };
    appendOptimisticMessage(optimistic);
    await sendMessage({ chatId, type: "TEXT", content });
  }

  async function handleSendMedia(url: string, type: "IMAGE" | "VIDEO") {
    const optimistic: MessageItem = {
      id: `optimistic-${Date.now()}`,
      chatId,
      senderId: viewerId,
      type,
      content: null,
      mediaUrl: url,
      createdAt: new Date().toISOString(),
      isReadByOther: false,
    };
    appendOptimisticMessage(optimistic);
    await sendMessage({ chatId, type, mediaUrl: url });
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-2 overflow-y-auto px-3 py-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} isOwn={message.senderId === viewerId} />
        ))}
        <div ref={bottomRef} />
      </div>

      {typingUsername && <TypingIndicator username={typingUsername} />}

      <MessageComposer
        onSendText={handleSendText}
        onSendMedia={handleSendMedia}
        onTyping={handleTyping}
      />
    </div>
  );
}
