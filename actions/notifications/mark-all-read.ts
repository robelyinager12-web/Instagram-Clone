"use server";

import { prisma } from "@/lib/db/prisma";
import { requireCurrentUser } from "@/lib/auth/current-user";

export async function markAllNotificationsRead() {
  const user = await requireCurrentUser();

  await prisma.notification.updateMany({
    where: { recipientId: user.id, isRead: false },
    data: { isRead: true },
  });

  return { ok: true };
}
