"use server";

import { prisma } from "@/lib/db/prisma";
import { requireCurrentUser } from "@/lib/auth/current-user";

export async function markStoryViewed(storyId: string) {
  const user = await requireCurrentUser();

  await prisma.storyView.upsert({
    where: { storyId_viewerId: { storyId, viewerId: user.id } },
    create: { storyId, viewerId: user.id },
    update: {},
  });

  return { ok: true };
}
