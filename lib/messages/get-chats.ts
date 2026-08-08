import { prisma } from "@/lib/db/prisma";
import type { ChatSummary } from "@/types/message";

export async function getChatList(userId: string): Promise<ChatSummary[]> {
  const memberships = await prisma.chatMember.findMany({
    where: { userId },
    include: {
      chat: {
        include: {
          members: {
            include: {
              user: { select: { id: true, username: true, avatarUrl: true } },
            },
          },
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      },
    },
    orderBy: { chat: { updatedAt: "desc" } },
  });

  const chatIds = memberships.map((m) => m.chatId);

  const unreadCounts = chatIds.length
    ? await prisma.message.groupBy({
        by: ["chatId"],
        where: {
          chatId: { in: chatIds },
          senderId: { not: userId },
          reads: { none: { userId } },
        },
        _count: { id: true },
      })
    : [];
  const unreadByChat = new Map(unreadCounts.map((u) => [u.chatId, u._count.id]));

  return memberships.map(({ chat }): ChatSummary => {
    const otherMember = chat.members.find((m) => m.user.id !== userId);
    const lastMessage = chat.messages[0];

    return {
      id: chat.id,
      type: chat.type,
      name: chat.name,
      otherParticipant:
        chat.type === "DIRECT" && otherMember
          ? {
              id: otherMember.user.id,
              username: otherMember.user.username,
              avatarUrl: otherMember.user.avatarUrl,
            }
          : null,
      lastMessage: lastMessage
        ? {
            content: lastMessage.content,
            type: lastMessage.type,
            senderId: lastMessage.senderId,
            createdAt: lastMessage.createdAt.toISOString(),
          }
        : null,
      unreadCount: unreadByChat.get(chat.id) ?? 0,
    };
  });
}

export async function findOrCreateDirectChat(userAId: string, userBId: string) {
  const existing = await prisma.chat.findFirst({
    where: {
      type: "DIRECT",
      AND: [
        { members: { some: { userId: userAId } } },
        { members: { some: { userId: userBId } } },
      ],
    },
  });
  if (existing) return existing;

  return prisma.chat.create({
    data: {
      type: "DIRECT",
      members: { create: [{ userId: userAId }, { userId: userBId }] },
    },
  });
}
