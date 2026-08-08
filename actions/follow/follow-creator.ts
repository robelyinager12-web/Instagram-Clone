"use server";

import { prisma } from "@/lib/db/prisma";
import { requireCurrentUser } from "@/lib/auth/current-user";

export async function followCreator(targetUserId: string) {
  const user = await requireCurrentUser();
  if (user.id === targetUserId) return { following: false };

  const target = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { isPrivate: true },
  });
  if (!target) throw new Error("User not found");

  const existing = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId: user.id, followingId: targetUserId } },
  });

  if (existing) {
    await prisma.follow.delete({ where: { id: existing.id } });
    return { following: false };
  }

  await prisma.follow.create({
    data: {
      followerId: user.id,
      followingId: targetUserId,
      status: target.isPrivate ? "PENDING" : "ACCEPTED",
    },
  });

  if (!target.isPrivate) {
    await prisma.notification.create({
      data: { recipientId: targetUserId, actorId: user.id, type: "FOLLOW" },
    });
  }

  return { following: !target.isPrivate };
}
