import { prisma } from "@/lib/db/prisma";

export type FollowListEntry = {
  id: string;
  username: string;
  fullName: string | null;
  avatarUrl: string | null;
  isVerified: boolean;
  isFollowedByViewer: boolean;
};

export async function getFollowersList(
  profileUserId: string,
  viewerId: string
): Promise<FollowListEntry[]> {
  const followers = await prisma.follow.findMany({
    where: { followingId: profileUserId, status: "ACCEPTED" },
    include: {
      follower: {
        select: { id: true, username: true, fullName: true, avatarUrl: true, isVerified: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return attachViewerFollowStatus(followers.map((f) => f.follower), viewerId);
}

export async function getFollowingList(
  profileUserId: string,
  viewerId: string
): Promise<FollowListEntry[]> {
  const following = await prisma.follow.findMany({
    where: { followerId: profileUserId, status: "ACCEPTED" },
    include: {
      following: {
        select: { id: true, username: true, fullName: true, avatarUrl: true, isVerified: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return attachViewerFollowStatus(following.map((f) => f.following), viewerId);
}

async function attachViewerFollowStatus(
  users: { id: string; username: string; fullName: string | null; avatarUrl: string | null; isVerified: boolean }[],
  viewerId: string
): Promise<FollowListEntry[]> {
  const viewerFollowing = await prisma.follow.findMany({
    where: { followerId: viewerId, followingId: { in: users.map((u) => u.id) }, status: "ACCEPTED" },
    select: { followingId: true },
  });
  const followedSet = new Set(viewerFollowing.map((f) => f.followingId));

  return users.map((u) => ({ ...u, isFollowedByViewer: followedSet.has(u.id) }));
}
