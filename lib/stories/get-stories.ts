import { prisma } from "@/lib/db/prisma";
import type { StoryGroup } from "@/types/story";

/**
 * Returns one group per author who has at least one non-expired story,
 * viewer's own group first, then followed authors ordered by whether
 * they have anything unseen (unseen-first, like the real app's tray).
 */
export async function getActiveStoryGroups(viewerId: string): Promise<StoryGroup[]> {
  const following = await prisma.follow.findMany({
    where: { followerId: viewerId, status: "ACCEPTED" },
    select: { followingId: true },
  });
  const authorIds = [viewerId, ...following.map((f) => f.followingId)];

  const stories = await prisma.story.findMany({
    where: {
      authorId: { in: authorIds },
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "asc" },
    include: {
      author: { select: { id: true, username: true, avatarUrl: true } },
      views: { where: { viewerId }, select: { id: true } },
    },
  });

  const groupsByAuthor = new Map<string, StoryGroup>();

  for (const story of stories) {
    const key = story.author.id;
    if (!groupsByAuthor.has(key)) {
      groupsByAuthor.set(key, {
        author: story.author,
        stories: [],
        hasUnseen: false,
      });
    }
    const group = groupsByAuthor.get(key)!;
    const isSeen = story.views.length > 0;
    group.stories.push({
      id: story.id,
      mediaUrl: story.mediaUrl,
      mediaType: story.mediaType,
      caption: story.caption,
      createdAt: story.createdAt.toISOString(),
      expiresAt: story.expiresAt.toISOString(),
      isSeenByViewer: isSeen,
    });
    if (!isSeen) group.hasUnseen = true;
  }

  const groups = Array.from(groupsByAuthor.values());

  return groups.sort((a, b) => {
    if (a.author.id === viewerId) return -1;
    if (b.author.id === viewerId) return 1;
    return Number(b.hasUnseen) - Number(a.hasUnseen);
  });
}
