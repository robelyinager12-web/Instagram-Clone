"use server";

import { requireCurrentUser } from "@/lib/auth/current-user";
import { findOrCreateDirectChat } from "@/lib/messages/get-chats";

export async function openDirectChat(targetUserId: string) {
  const user = await requireCurrentUser();
  if (user.id === targetUserId) throw new Error("Cannot message yourself");

  const chat = await findOrCreateDirectChat(user.id, targetUserId);
  return { chatId: chat.id };
}
