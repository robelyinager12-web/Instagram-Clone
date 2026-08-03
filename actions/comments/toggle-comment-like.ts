"use server";

import { prisma } from "@/lib/db/prisma";
import { requireCurrentUser } from "@/lib/auth/current-user";

export async function toggleCommentLike(commentId: string) {
  const user = await requireCurrentUser();

  const existing = await prisma.like.findUnique({
    where: { userId_commentId: { userId: user.id, commentId } },
  });

  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } });
    return { liked: false };
  }

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { authorId: true, postId: true },
  });
  if (!comment) throw new Error("Comment not found");

  await prisma.like.create({ data: { userId: user.id, commentId } });

  if (comment.authorId !== user.id) {
    await prisma.notification.create({
      data: {
        recipientId: comment.authorId,
        actorId: user.id,
        type: "LIKE_COMMENT",
        postId: comment.postId,
        commentId,
      },
    });
  }

  return { liked: true };
}
