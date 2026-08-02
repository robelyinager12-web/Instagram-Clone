import { prisma } from "@/lib/db/prisma";
import type { FeedPage } from "@/types/feed";

const PAGE_SIZE = 10;

/**
 * "Algorithmic" feed, kept intentionally simple and explainable:
 *   1. Posts from people the viewer follows, plus the viewer's own posts.
 *   2. Ranked by a recency-decayed engagement score, not pure chronology,
 *      so a post from 3 hours ago with lots of likes can outrank one from
 *      20 minutes ago with none — same idea as a real ranked feed, without
 *      pulling in a scoring service.
 *   3. Falls back to recent public posts from anyone if the viewer follows
 *      very few people, so new accounts don't see an empty feed.
 */
export async function getFeedPage({
  viewerId,
  cursor,
}: {
  viewerId: string;
  cursor?: string;
}): Promise<FeedPage> {
  const following = await prisma.follow.findMany({
    where: { followerId: viewerId, status: "ACCEPTED" },
    select: { followingId: true },
  });

  const authorIds = [viewerId, ...following.map((f) => f.followingId)];
  const hasEnoughFollows = following.length >= 5;

  const where = hasEnoughFollows
    ? { authorId: { in: authorIds }, isArchived: false }
    : { isArchived: false, visibility: "PUBLIC" as const };

  const posts = await prisma.post.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: PAGE_SIZE + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    include: {
      author: {
        select: {
          id: true,
          username: true,
          fullName: true,
          avatarUrl: true,
          isVerified: true,
        },
      },
      media: { orderBy: { order: "asc" } },
      _count: { select: { likes: true, comments: true } },
      likes: { where: { userId: viewerId }, select: { id: true } },
      bookmarks: { where: { userId: viewerId }, select: { id: true } },
    },
  });

  const hasNextPage = posts.length > PAGE_SIZE;
  const pagePosts = hasNextPage ? posts.slice(0, PAGE_SIZE) : posts;

  const now = Date.now();
  const ranked = hasEnoughFollows
    ? [...pagePosts].sort((a, b) => scorePost(b, now) - scorePost(a, now))
    : pagePosts;

  return {
    posts: ranked.map((post) => ({
      id: post.id,
      caption: post.caption,
      location: post.location,
      createdAt: post.createdAt.toISOString(),
      author: post.author,
      media: post.media.map((m) => ({
        id: m.id,
        url: m.url,
        type: m.type,
        order: m.order,
      })),
      likeCount: post._count.likes,
      commentCount: post._count.comments,
      isLikedByViewer: post.likes.length > 0,
      isBookmarkedByViewer: post.bookmarks.length > 0,
    })),
    nextCursor: hasNextPage ? pagePosts[pagePosts.length - 1].id : null,
  };
}

function scorePost(
  post: { createdAt: Date; _count: { likes: number; comments: number } },
  now: number
) {
  const ageHours = (now - post.createdAt.getTime()) / (1000 * 60 * 60);
  const decay = Math.exp(-ageHours / 18);
  const engagement = post._count.likes + post._count.comments * 2;
  return engagement * decay;
}
