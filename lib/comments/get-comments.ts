import { prisma } from "@/lib/db/prisma";
import type { CommentItem, CommentsPage, ReplyItem } from "@/types/comment";

const PAGE_SIZE = 10;
const REPLIES_PER_COMMENT = 3;

export async function getCommentsPage({
  postId,
  viewerId,
  cursor,
}: {
  postId: string;
  viewerId: string;
  cursor?: string;
}): Promise<CommentsPage> {
  const comments = await prisma.comment.findMany({
    where: { postId, parentId: null },
    orderBy: { createdAt: "asc" },
    take: PAGE_SIZE + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    include: {
      author: { select: { id: true, username: true, avatarUrl: true } },
      likes: { where: { userId: viewerId }, select: { id: true } },
      _count: { select: { likes: true, replies: true } },
      replies: {
        orderBy: { createdAt: "asc" },
        take: REPLIES_PER_COMMENT,
        include: {
          author: { select: { id: true, username: true, avatarUrl: true } },
          likes: { where: { userId: viewerId }, select: { id: true } },
          _count: { select: { likes: true } },
        },
      },
    },
  });

  const hasNextPage = comments.length > PAGE_SIZE;
  const pageComments = hasNextPage ? comments.slice(0, PAGE_SIZE) : comments;

  return {
    comments: pageComments.map((c): CommentItem => ({
      id: c.id,
      content: c.content,
      createdAt: c.createdAt.toISOString(),
      isEdited: c.isEdited,
      author: c.author,
      likeCount: c._count.likes,
      isLikedByViewer: c.likes.length > 0,
      isOwnComment: c.authorId === viewerId,
      replyCount: c._count.replies,
      replies: c.replies.map(
        (r): ReplyItem => ({
          id: r.id,
          content: r.content,
          createdAt: r.createdAt.toISOString(),
          isEdited: r.isEdited,
          author: r.author,
          likeCount: r._count.likes,
          isLikedByViewer: r.likes.length > 0,
          isOwnComment: r.authorId === viewerId,
        })
      ),
    })),
    nextCursor: hasNextPage ? pageComments[pageComments.length - 1].id : null,
  };
}
