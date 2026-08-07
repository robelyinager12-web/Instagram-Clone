import { prisma } from "@/lib/db/prisma";

export async function getUserDrafts(userId: string) {
  const drafts = await prisma.draft.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });

  return drafts.map((d) => ({
    id: d.id,
    caption: d.caption,
    mediaUrls: d.mediaUrls,
    location: d.location,
    updatedAt: d.updatedAt.toISOString(),
  }));
}
