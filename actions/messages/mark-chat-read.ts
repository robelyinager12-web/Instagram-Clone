"use server";

import { prisma } from "@/lib/db/prisma";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { triggerEvent, chatChannel, PUSHER_EVENTS } from "@/services/pusher/server";

export async function markChatRead(chatId: string) {
  const user = await requireCurrentUser();

  const unreadMessages = await prisma.message.findMany({
    where: {
      chatId,
      senderId: { not: user.id },
      reads: { none: { userId: user.id } },
    },
    select: { id: true },
  });

  if (unreadMessages.length === 0) return { ok: true };

  await prisma.messageRead.createMany({
    data: unreadMessages.map((m) => ({ messageId: m.id, userId: user.id })),
    skipDuplicates: true,
  });

  await triggerEvent(chatChannel(chatId), PUSHER_EVENTS.MESSAGE_READ, {
    readerId: user.id,
    messageIds: unreadMessages.map((m) => m.id),
  });

  return { ok: true };
}
