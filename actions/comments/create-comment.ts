"use server";

import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { revalidatePath } from "next/cache";

const createCommentSchema = z.object({
  postId: z.string(),
  content: z.string().trim().min(1).max(2200),
  parentId: z.string().optional(),
});

export async function createComment(input: z.infer<typeof createCommentSchema>) {
  const user = await requireCurrentUser();
  const data = createCommentSchema.parse(input);

  const post = await prisma.post.findUnique({
    where: { id: data.postId },
    select: { authorId: true, commentsOff: true },
  });
  if (!post) throw new Error("Post not found");
  if (post.commentsOff) throw new Error("Comments are off for this post");

  const comment = await prisma.comment.create({
    data: {
      postId: data.postId,
      authorId: user.id,
      content: data.content,
      parentId: data.parentId,
    },
    include: { author: { select: { id: true, username: true, avatarUrl: true } } },
  });

  if (data.parentId) {
    const parent = await prisma.comment.findUnique({
      where: { id: data.parentId },
      select: { authorId: true },
    });
    if (parent && parent.authorId !== user.id) {
      await prisma.notification.create({
        data: {
          recipientId: parent.authorId,
          actorId: user.id,
          type: "REPLY",
          postId: data.postId,
          commentId: comment.id,
        },
      });
    }
  } else if (post.authorId !== user.id) {
    await prisma.notification.create({
      data: {
        recipientId: post.authorId,
        actorId: user.id,
        type: "COMMENT",
        postId: data.postId,
        commentId: comment.id,
      },
    });
  }

  revalidatePath(`/post/${data.postId}`);

  return {
    id: comment.id,
    content: comment.content,
    createdAt: comment.createdAt.toISOString(),
    isEdited: false,
    author: comment.author,
    likeCount: 0,
    isLikedByViewer: false,
    isOwnComment: true,
    replies: [],
    replyCount: 0,
  };
}
