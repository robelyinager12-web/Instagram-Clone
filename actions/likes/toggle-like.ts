"use server";

import { prisma } from "@/lib/db/prisma";
import { requireCurrentUser } from "@/lib/auth/current-user";

export async function toggleLike(postId: string) {
  const user = await requireCurrentUser();

  const existing = await prisma.like.findUnique({
    where: { userId_postId: { userId: user.id, postId } },
  });

  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } });
    return { liked: false };
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { authorId: true },
  });
  if (!post) throw new Error("Post not found");

  await prisma.like.create({ data: { userId: user.id, postId } });

  if (post.authorId !== user.id) {
    await prisma.notification.create({
      data: {
        recipientId: post.authorId,
        actorId: user.id,
        type: "LIKE_POST",
        postId,
      },
    });
  }

  return { liked: true };
}
