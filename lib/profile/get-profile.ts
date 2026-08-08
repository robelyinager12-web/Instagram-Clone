import { prisma } from "@/lib/db/prisma";
import type { ProfileData, ProfilePost, ProfilePostsPage } from "@/types/profile";

export async function getProfile(
  username: string,
  viewerId: string
): Promise<ProfileData | null> {
  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      fullName: true,
      bio: true,
      website: true,
      avatarUrl: true,
      isVerified: true,
      isPrivate: true,
      isActive: true,
      _count: {
        select: { posts: true, followers: true, following: true },
      },
    },
  });

  if (!user || !user.isActive) return null;

  const isOwnProfile = user.id === viewerId;

  const [follow, block] = await Promise.all([
    isOwnProfile
      ? null
      : prisma.follow.findUnique({
          where: { followerId_followingId: { followerId: viewerId, followingId: user.id } },
        }),
    isOwnProfile
      ? null
      : prisma.block.findFirst({
          where: {
            OR: [
              { blockerId: user.id, blockedId: viewerId },
              { blockerId: viewerId, blockedId: user.id },
            ],
          },
        }),
  ]);

  const followStatus = follow ? follow.status : "NONE";
  const canViewPosts =
    isOwnProfile || !user.isPrivate || followStatus === "ACCEPTED";

  return {
    id: user.id,
    username: user.username,
    fullName: user.fullName,
    bio: user.bio,
    website: user.website,
    avatarUrl: user.avatarUrl,
    isVerified: user.isVerified,
    isPrivate: user.isPrivate,
    postCount: user._count.posts,
    followerCount: user._count.followers,
    followingCount: user._count.following,
    isOwnProfile,
    followStatus,
    isBlockedByViewer: !!block,
    canViewPosts,
  };
}

const PAGE_SIZE = 24;

export async function getProfilePostsPage({
  userId,
  cursor,
}: {
  userId: string;
  cursor?: string;
}): Promise<ProfilePostsPage> {
  const posts = await prisma.post.findMany({
    where: { authorId: userId, isArchived: false },
    orderBy: { createdAt: "desc" },
    take: PAGE_SIZE + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    include: {
      media: { orderBy: { order: "asc" }, take: 1 },
      _count: { select: { likes: true, comments: true, media: true } },
    },
  });

  const hasNextPage = posts.length > PAGE_SIZE;
  const page = hasNextPage ? posts.slice(0, PAGE_SIZE) : posts;

  return {
    posts: page
      .filter((p) => p.media[0])
      .map(
        (p): ProfilePost => ({
          id: p.id,
          thumbnailUrl: p.media[0].url,
          mediaType: p.media[0].type,
          isCarousel: p._count.media > 1,
          likeCount: p._count.likes,
          commentCount: p._count.comments,
        })
      ),
    nextCursor: hasNextPage ? page[page.length - 1].id : null,
  };
}
