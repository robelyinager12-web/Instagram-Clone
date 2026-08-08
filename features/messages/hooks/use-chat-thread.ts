import { useEffect, useRef, useState } from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { getPusherClient, chatChannel, PUSHER_EVENTS } from "@/services/pusher/client";
import { markChatRead } from "@/actions/messages/mark-chat-read";
import type { MessageItem, MessagesPage } from "@/types/message";

async function fetchMessagesPage(chatId: string, cursor?: string): Promise<MessagesPage> {
  const url = cursor
    ? `/api/messages?chatId=${chatId}&cursor=${cursor}`
    : `/api/messages?chatId=${chatId}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to load messages");
  return res.json();
}

export function useChatThread(chatId: string, viewerId: string, initialPage: MessagesPage) {
  const queryClient = useQueryClient();
  const [typingUsername, setTypingUsername] = useState<string | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const query = useInfiniteQuery({
    queryKey: ["messages", chatId],
    queryFn: ({ pageParam }) => fetchMessagesPage(chatId, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialData: { pages: [initialPage], pageParams: [undefined] },
  });

  useEffect(() => {
    const pusher = getPusherClient();
    const channel = pusher.subscribe(chatChannel(chatId));

    channel.bind(PUSHER_EVENTS.NEW_MESSAGE, (message: MessageItem) => {
      if (message.senderId === viewerId) return;
      queryClient.setQueryData<{ pages: MessagesPage[]; pageParams: unknown[] }>(
        ["messages", chatId],
        (old) => {
          if (!old) return old;
          const pages = [...old.pages];
          const lastPageIndex = pages.length - 1;
          pages[lastPageIndex] = {
            ...pages[lastPageIndex],
            messages: [...pages[lastPageIndex].messages, message],
          };
          return { ...old, pages };
        }
      );
      markChatRead(chatId).catch(() => {});
    });

    channel.bind(PUSHER_EVENTS.MESSAGE_READ, ({ readerId }: { readerId: string }) => {
      if (readerId === viewerId) return;
      queryClient.setQueryData<{ pages: MessagesPage[]; pageParams: unknown[] }>(
        ["messages", chatId],
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((p) => ({
              ...p,
              messages: p.messages.map((m) =>
                m.senderId === viewerId ? { ...m, isReadByOther: true } : m
              ),
            })),
          };
        }
      );
    });

    channel.bind(PUSHER_EVENTS.TYPING, ({ username, userId }: { username: string; userId: string }) => {
      if (userId === viewerId) return;
      setTypingUsername(username);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => setTypingUsername(null), 3000);
    });

    return () => {
      pusher.unsubscribe(chatChannel(chatId));
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [chatId, viewerId, queryClient]);

  function broadcastTyping(username: string) {
    const pusher = getPusherClient();
    const channel = pusher.channel(chatChannel(chatId));
    channel?.trigger(PUSHER_EVENTS.TYPING, { username, userId: viewerId });
  }

  function appendOptimisticMessage(message: MessageItem) {
    queryClient.setQueryData<{ pages: MessagesPage[]; pageParams: unknown[] }>(
      ["messages", chatId],
      (old) => {
        if (!old) return old;
        const pages = [...old.pages];
        const lastPageIndex = pages.length - 1;
        pages[lastPageIndex] = {
          ...pages[lastPageIndex],
          messages: [...pages[lastPageIndex].messages, message],
        };
        return { ...old, pages };
      }
    );
  }

  return { ...query, typingUsername, broadcastTyping, appendOptimisticMessage };
}
