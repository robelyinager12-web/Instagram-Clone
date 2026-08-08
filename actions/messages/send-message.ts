"use server";

import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { triggerEvent, chatChannel, userChannel, PUSHER_EVENTS } from "@/services/pusher/server";

const sendMessageSchema = z.object({
  chatId: z.string(),
  type: z.enum(["TEXT", "IMAGE", "VIDEO", "VOICE", "POST_SHARE", "REEL_SHARE"]).default("TEXT"),
  content: z.string().trim().max(2200).optional(),
  mediaUrl: z.string().url().optional(),
});

export async function sendMessage(input: z.infer<typeof sendMessageSchema>) {
  const user = await requireCurrentUser();
  const data = sendMessageSchema.parse(input);

  const membership = await prisma.chatMember.findUnique({
    where: { chatId_userId: { chatId: data.chatId, userId: user.id } },
  });
  if (!membership) throw new Error("Not a member of this chat");

  const message = await prisma.message.create({
    data: {
      chatId: data.chatId,
      senderId: user.id,
      type: data.type,
      content: data.content,
      mediaUrl: data.mediaUrl,
    },
  });

  await prisma.chat.update({
    where: { id: data.chatId },
    data: { updatedAt: new Date() },
  });

  const payload = {
    id: message.id,
    chatId: message.chatId,
    senderId: message.senderId,
    type: message.type,
    content: message.content,
    mediaUrl: message.mediaUrl,
    createdAt: message.createdAt.toISOString(),
    isReadByOther: false,
  };

  await triggerEvent(chatChannel(data.chatId), PUSHER_EVENTS.NEW_MESSAGE, payload);

  const otherMembers = await prisma.chatMember.findMany({
    where: { chatId: data.chatId, userId: { not: user.id } },
    select: { userId: true },
  });
  await Promise.all(
    otherMembers.map((m) =>
      triggerEvent(userChannel(m.userId), PUSHER_EVENTS.NEW_MESSAGE, payload)
    )
  );

  return payload;
}
