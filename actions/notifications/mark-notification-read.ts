"use server";

import { prisma } from "@/lib/db/prisma";
import { requireCurrentUser } from "@/lib/auth/current-user";

export async function markNotificationRead(notificationId: string) {
  const user = await requireCurrentUser();

  await prisma.notification.updateMany({
    where: { id: notificationId, recipientId: user.id },
    data: { isRead: true },
  });

  return { ok: true };
}
