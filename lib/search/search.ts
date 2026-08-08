import { prisma } from "@/lib/db/prisma";
import type { SearchResults } from "@/types/search";

const RESULTS_PER_CATEGORY = 6;

export async function searchAll(query: string): Promise<SearchResults> {
  const trimmed = query.trim();
  if (!trimmed) {
    return { users: [], hashtags: [], locations: [] };
  }

  const hashtagQuery = trimmed.replace(/^#/, "");

  const [users, hashtags, locationGroups] = await Promise.all([
    prisma.user.findMany({
      where: {
        isActive: true,
        isBanned: false,
        OR: [
          { username: { contains: trimmed, mode: "insensitive" } },
          { fullName: { contains: trimmed, mode: "insensitive" } },
        ],
      },
      take: RESULTS_PER_CATEGORY,
      orderBy: { followers: { _count: "desc" } },
      select: {
        id: true,
        username: true,
        fullName: true,
        avatarUrl: true,
        isVerified: true,
        _count: { select: { followers: true } },
      },
    }),

    prisma.hashtag.findMany({
      where: { tag: { contains: hashtagQuery, mode: "insensitive" } },
      take: RESULTS_PER_CATEGORY,
      orderBy: { postCount: "desc" },
    }),

    prisma.post.groupBy({
      by: ["location"],
      where: {
        location: { contains: trimmed, mode: "insensitive", not: null },
        isArchived: false,
        visibility: "PUBLIC",
      },
      _count: { location: true },
      orderBy: { _count: { location: "desc" } },
      take: RESULTS_PER_CATEGORY,
    }),
  ]);

  return {
    users: users.map((u) => ({
      id: u.id,
      username: u.username,
      fullName: u.fullName,
      avatarUrl: u.avatarUrl,
      isVerified: u.isVerified,
      followerCount: u._count.followers,
    })),
    hashtags: hashtags.map((h) => ({ id: h.id, tag: h.tag, postCount: h.postCount })),
    locations: locationGroups
      .filter((g) => g.location)
      .map((g) => ({
        location: g.location as string,
        postCount: g._count.location,
      })),
  };
}
