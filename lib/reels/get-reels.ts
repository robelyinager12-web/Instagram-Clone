import { prisma } from "@/lib/db/prisma";
import type { ReelsPage } from "@/types/reel";

const PAGE_SIZE = 8;

export async function getReelsPage({
  viewerId,
  cursor,
}: {
  viewerId: string;
  cursor?: string;
}): Promise<ReelsPage> {
  const reels = await prisma.reel.findMany({
    orderBy: { createdAt: "desc" },
    take: PAGE_SIZE + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    include: {
      author: {
        select: { id: true, username: true, avatarUrl: true, isVerified: true },
      },
      _count: { select: { likes: true, comments: true } },
      likes: { where: { userId: viewerId }, select: { id: true } },
    },
  });

  const hasNextPage = reels.length > PAGE_SIZE;
  const pageReels = hasNextPage ? reels.slice(0, PAGE_SIZE) : reels;

  const authorIds = pageReels.map((r) => r.authorId);
  const following = await prisma.follow.findMany({
    where: { followerId: viewerId, followingId: { in: authorIds } },
    select: { followingId: true },
  });
  const followingSet = new Set(following.map((f) => f.followingId));

  return {
    reels: pageReels.map((reel) => ({
      id: reel.id,
      videoUrl: reel.videoUrl,
      thumbnailUrl: reel.thumbnailUrl,
      caption: reel.caption,
      audioName: reel.audioName,
      createdAt: reel.createdAt.toISOString(),
      author: reel.author,
      likeCount: reel._count.likes,
      commentCount: reel._count.comments,
      isLikedByViewer: reel.likes.length > 0,
      isFollowingAuthor: followingSet.has(reel.authorId),
    })),
    nextCursor: hasNextPage ? pageReels[pageReels.length - 1].id : null,
  };
}
