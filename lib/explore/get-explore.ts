import { prisma } from "@/lib/db/prisma";
import type { ExplorePage } from "@/types/explore";

const PAGE_SIZE = 21;
const TRENDING_WINDOW_DAYS = 14;

export async function getExplorePage({
  viewerId,
  cursor,
}: {
  viewerId: string;
  cursor?: string;
}): Promise<ExplorePage> {
  const following = await prisma.follow.findMany({
    where: { followerId: viewerId, status: "ACCEPTED" },
    select: { followingId: true },
  });
  const excludeAuthorIds = [viewerId, ...following.map((f) => f.followingId)];

  const since = new Date(Date.now() - TRENDING_WINDOW_DAYS * 24 * 60 * 60 * 1000);

  const posts = await prisma.post.findMany({
    where: {
      authorId: { notIn: excludeAuthorIds },
      isArchived: false,
      visibility: "PUBLIC",
      createdAt: { gte: since },
    },
    orderBy: { createdAt: "desc" },
    take: PAGE_SIZE + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    include: {
      media: { orderBy: { order: "asc" }, take: 1 },
      _count: { select: { likes: true, comments: true, media: true } },
    },
  });

  const hasNextPage = posts.length > PAGE_SIZE;
  const pagePosts = hasNextPage ? posts.slice(0, PAGE_SIZE) : posts;

  const now = Date.now();
  const ranked = [...pagePosts].sort((a, b) => score(b, now) - score(a, now));

  return {
    tiles: ranked
      .filter((post) => post.media[0])
      .map((post) => ({
        id: post.id,
        mediaUrl: post.media[0].url,
        mediaType: post.media[0].type,
        width: post.media[0].width,
        height: post.media[0].height,
        likeCount: post._count.likes,
        commentCount: post._count.comments,
        isCarousel: post._count.media > 1,
      })),
    nextCursor: hasNextPage ? pagePosts[pagePosts.length - 1].id : null,
  };
}

function score(
  post: { createdAt: Date; _count: { likes: number; comments: number } },
  now: number
) {
  const ageHours = (now - post.createdAt.getTime()) / (1000 * 60 * 60);
  const decay = Math.exp(-ageHours / (24 * 3));
  const engagement = post._count.likes + post._count.comments * 2;
  return engagement * decay;
}
