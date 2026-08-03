"use server";

import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireCurrentUser } from "@/lib/auth/current-user";

const editCommentSchema = z.object({
  commentId: z.string(),
  content: z.string().trim().min(1).max(2200),
});

export async function editComment(input: z.infer<typeof editCommentSchema>) {
  const user = await requireCurrentUser();
  const data = editCommentSchema.parse(input);

  const comment = await prisma.comment.findUnique({
    where: { id: data.commentId },
    select: { authorId: true },
  });
  if (!comment) throw new Error("Comment not found");
  if (comment.authorId !== user.id) throw new Error("Not authorized");

  await prisma.comment.update({
    where: { id: data.commentId },
    data: { content: data.content, isEdited: true },
  });

  return { ok: true };
}
