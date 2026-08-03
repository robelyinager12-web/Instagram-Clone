"use server";

import { prisma } from "@/lib/db/prisma";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { revalidatePath } from "next/cache";

export async function deleteComment(commentId: string) {
  const user = await requireCurrentUser();

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { authorId: true, postId: true, post: { select: { authorId: true } } },
  });
  if (!comment) throw new Error("Comment not found");

  const canDelete =
    comment.authorId === user.id || comment.post.authorId === user.id;
  if (!canDelete) throw new Error("Not authorized");

  await prisma.comment.delete({ where: { id: commentId } });

  revalidatePath(`/post/${comment.postId}`);
  return { ok: true };
}
