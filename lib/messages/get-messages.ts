import { prisma } from "@/lib/db/prisma";
import type { MessagesPage } from "@/types/message";

const PAGE_SIZE = 30;

export async function getMessagesPage({
  chatId,
  viewerId,
  cursor,
}: {
  chatId: string;
  viewerId: string;
  cursor?: string;
}): Promise<MessagesPage> {
  const messages = await prisma.message.findMany({
    where: { chatId, deletedAt: null },
    orderBy: { createdAt: "desc" },
    take: PAGE_SIZE + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    include: {
      reads: { where: { userId: { not: viewerId } }, select: { id: true } },
    },
  });

  const hasNextPage = messages.length > PAGE_SIZE;
  const page = hasNextPage ? messages.slice(0, PAGE_SIZE) : messages;

  return {
    messages: page
      .map((m) => ({
        id: m.id,
        chatId: m.chatId,
        senderId: m.senderId,
        type: m.type,
        content: m.content,
        mediaUrl: m.mediaUrl,
        createdAt: m.createdAt.toISOString(),
        isReadByOther: m.reads.length > 0,
      }))
      .reverse(),
    nextCursor: hasNextPage ? page[page.length - 1].id : null,
  };
}
