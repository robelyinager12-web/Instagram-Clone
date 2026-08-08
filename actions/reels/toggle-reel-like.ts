"use server";

import { prisma } from "@/lib/db/prisma";
import { requireCurrentUser } from "@/lib/auth/current-user";

export async function toggleReelLike(reelId: string) {
  const user = await requireCurrentUser();

  const existing = await prisma.reelLike.findUnique({
    where: { reelId_userId: { reelId, userId: user.id } },
  });

  if (existing) {
    await prisma.reelLike.delete({ where: { id: existing.id } });
    return { liked: false };
  }

  await prisma.reelLike.create({ data: { reelId, userId: user.id } });
  return { liked: true };
}
